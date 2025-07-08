import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import { SocketContext } from "./SocketContext";

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, accessToken } = useAuth();
    const [loading, setLoading] = useState(true); // Initially true until connected
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!user || !accessToken.current) {
            console.log("No user or token. Disconnecting socket...");
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setLoading(false);
            return;
        }

        console.log("Creating socket connection with token...");

        const socket = io(import.meta.env.VITE_BACKEND_URL_SOCKET, {
            transports: ["websocket"],
            autoConnect: false,
        });

        // Attach token before connect
        socket.auth = { token: accessToken.current };
        socketRef.current = socket;

        // Start connecting
        socket.connect();

        // Connected
        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
            setLoading(false);
        });

        // Connection error (e.g., invalid token)
        socket.on("connect_error", async (err) => {
            console.error("Socket connection error:", err.message);

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

                    console.log("Token refreshed. Reconnecting socket...");
                    socket.auth = { token: newAccessToken };
                    socket.connect();
                } catch {
                    console.error("Failed to refresh token. Disconnecting socket.");
                    socket.disconnect();
                    socketRef.current = null;
                } finally {
                    setLoading(false);
                }
            } else {
                console.error("Unhandled socket error:", err.message);
                setLoading(false);
            }
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        return () => {
            console.log("Cleaning up socket connection");
            socket.disconnect();
            socketRef.current = null;
            setLoading(true);
        };
    }, [user, accessToken]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, loading }}>
            {children}
        </SocketContext.Provider>
    );
};
