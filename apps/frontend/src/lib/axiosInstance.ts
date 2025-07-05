import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import type { AxiosRequestConfig } from "axios";

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Mutable token reference
let accessTokenRef = { current: null as string | null };

// External setter (e.g., from auth hook/service)
export const setAccessTokenRef = (ref: typeof accessTokenRef) => {
  accessTokenRef = ref;
};

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessTokenRef.current && config.headers) {
      config.headers.Authorization = `Bearer ${accessTokenRef.current}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      try {
        originalRequest._retry = true;

        interface RefreshTokenResponse {
          accessToken: string;
        }

        const refreshRes = await axios.post<RefreshTokenResponse>(
          `${import.meta.env.VITE_BACKEND_URL}/refresh-token`,
          {},
          { withCredentials: true }
        );
        // console.log(refreshRes);

        const newAccessToken = refreshRes.data.accessToken;
        accessTokenRef.current = newAccessToken;

        // Retry original request with new token
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
