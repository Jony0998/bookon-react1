import React, { createContext } from "react";
import { io, Socket } from "socket.io-client";

const apiUrl =
  process.env.REACT_APP_API_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");
const socket = io(apiUrl, { withCredentials: true });
export const SocketContext = createContext<Socket>(socket);

interface SocketProviderProps {
  children: React.ReactNode;
}
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
