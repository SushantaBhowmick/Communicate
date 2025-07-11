import { createContext, useEffect } from "react";
import { socket } from "../services/socket";

const SocketContext = createContext(socket);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Fix the TypeScript error by properly typing the auth property
    const token = localStorage.getItem("token");
    (socket.auth as { token?: string }).token = token || undefined;
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
