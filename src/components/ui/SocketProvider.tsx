// src/components/ui/SocketProvider.tsx
"use client";
import { createContext, useEffect, useRef, useState } from "react";
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
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("sent token", token);

    if (token && !socketRef.current) {
      const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/game`, {
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("newSocket", newSocket);
      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Connected to server");
      });

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };
