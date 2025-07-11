import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import { SocketContext } from "./SocketContext";

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, accessToken } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Disconnect if no user or token
        if (!user || !accessToken.current) {
            console.log("No user or token. Disconnecting socket...");
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            setLoading(false);
            return;
        }

        // console.log("Creating socket connection with token...");

        const socketInstance = io(import.meta.env.VITE_BACKEND_URL_SOCKET, {
            transports: ["websocket"],
            autoConnect: false,
        });

        socketInstance.auth = { token: accessToken.current };
        socketInstance.connect();
        setSocket(socketInstance); // Triggers context consumers

        // On connect
        socketInstance.on("connect", () => {
            // console.log("Socket connected:", socketInstance.id);
            setLoading(false);
        });

        // On connection error
        socketInstance.on("connect_error", async (err) => {
            // console.error("Socket connection error:", err.message);

            if (err.message.includes("invalid token") || err.message.includes("jwt expired")) {
                console.warn("Token expired. Trying to refresh...");

                try {
                    setLoading(true);
                    const refreshRes = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/refresh-token`,
                        {},
                        { withCredentials: true }
                    );

                    const newAccessToken = refreshRes.data.accessToken;
                    accessToken.current = newAccessToken;

                    // console.log("Token refreshed. Reconnecting socket...");
                    socketInstance.auth = { token: newAccessToken };
                    socketInstance.connect();
                } catch {
                    // console.error("Failed to refresh token. Disconnecting socket.");
                    socketInstance.disconnect();
                    setSocket(null);
                } finally {
                    setLoading(false);
                }
            } else {
                // console.error("Unhandled socket error:", err.message);
                setLoading(false);
            }
        });

        socketInstance.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        return () => {
            // console.log("Cleaning up socket connection");
            socketInstance.disconnect();
            setSocket(null);
            setLoading(true);
        };
    }, [user, accessToken]);

    return (
        <SocketContext.Provider value={{ socket, loading }}>
            {children}
        </SocketContext.Provider>
    );
};