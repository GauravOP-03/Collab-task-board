import { createContext } from "react";
import { Socket } from "socket.io-client";

export interface SocketContextType {
  socket: Socket | null;
  loading: boolean;
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  loading: false,
});
