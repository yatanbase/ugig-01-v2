// components/SocketProvider.tsx
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
  const [token, setToken] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const createSocketConnection = (token: string | null) => {
    // Disconnect and clean up any existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    if (!token) return; // Don't create a connection if there's no token

    const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/game`, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("newSocket", newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken); // Set initial token state

    createSocketConnection(storedToken); // Create initial connection if token exists

    return () => {
      socket?.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, []);

  // Recreate connection when token changes
  useEffect(() => {
    createSocketConnection(token); // Create connection (or disconnect if token is null)

    return () => {
      socket?.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [token]);

  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      console.log("newToken", newToken);

      setToken(newToken);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };
