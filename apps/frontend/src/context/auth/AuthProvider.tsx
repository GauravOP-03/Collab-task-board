import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { setAccessTokenRef } from "../../lib/axiosInstance";
import { AuthContext } from "./AuthContext";
import type { UserProp } from "../../types/schema";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserProp | null>(null);
    const [loading, setLoading] = useState(true);
    const accessToken = useRef<string | null>(null);

    useEffect(() => {
        setAccessTokenRef(accessToken);
    }, []);

    const fetchUser = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${accessToken.current}`,
                },
            });
            setUser(res.data);
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status === 401) {
                try {
                    const refreshRes = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/refresh-token`,
                        {},
                        { withCredentials: true }
                    );
                    accessToken.current = refreshRes.data.accessToken;

                    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/me`, {
                        headers: {
                            Authorization: `Bearer ${accessToken.current}`,
                        },
                    });
                    setUser(res.data);
                } catch {
                    console.warn("Refresh Token invalid");
                    setUser(null);
                }
            } else {
                console.error("Error fetching user", e);
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async () => {
        accessToken.current = null;
        await fetchUser();
    };

    const logout = async () => {
        await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/logout`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken.current}`,
                },
                withCredentials: true,
            }
        );
        setUser(null);
        accessToken.current = null;
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, accessToken }}>
            {children}
        </AuthContext.Provider>
    );
};
