// components/SocketProvider.tsx
"use client";
import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextValue {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
});

interface SocketProviderProps {
  children: React.ReactNode;
}

const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const token = localStorage.getItem("token");
  console.log("sent token", token);

  useEffect(() => {
    // Get token from local storage
    if (token) {
      const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/game`, {
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("newSocket", newSocket);
      setSocket(newSocket);
      newSocket.on("connect", () => {
        console.log("Connected to server");
      });

      return () => {
        newSocket?.disconnect();
        setSocket(null);
      };
    }
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };
