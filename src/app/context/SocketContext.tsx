import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { serverApi } from "../../lib/config";
import { useGlobals } from "../hooks/useGlobals";

/**
 * One Socket.io connection for the whole app. The server reads who we are
 * from the cookies at connect time, so the socket reconnects when the reader
 * signs in or out.
 */
const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authMember } = useGlobals();
  const [socket, setSocket] = useState<Socket | null>(null);
  const memberId = authMember?._id ?? null;

  useEffect(() => {
    const s = io(serverApi, { withCredentials: true, transports: ["websocket", "polling"] });
    setSocket(s);
    return () => {
      s.close();
    };
  }, [memberId]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);

/** Subscribe to a server event for as long as the component is mounted */
export function useSocketEvent<T = any>(event: string, handler: (payload: T) => void) {
  const socket = useSocket();
  const latest = useRef(handler);
  latest.current = handler;
  useEffect(() => {
    if (!socket) return;
    const listener = (payload: T) => latest.current(payload);
    socket.on(event, listener);
    return () => {
      socket.off(event, listener);
    };
  }, [socket, event]);
}

/** true while the socket is connected (re-renders on connect/disconnect) */
export function useSocketConnected() {
  const socket = useSocket();
  const [connected, setConnected] = useState(!!socket?.connected);
  useEffect(() => {
    if (!socket) return;
    const on = () => setConnected(true);
    const off = () => setConnected(false);
    setConnected(socket.connected);
    socket.on("connect", on);
    socket.on("disconnect", off);
    return () => {
      socket.off("connect", on);
      socket.off("disconnect", off);
    };
  }, [socket]);
  return connected;
}
