// components/SocketProvider.tsx
"use client";
import { createContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
      const username = sessionStorage.getItem("username");
      if (username) {
        console.log(`Connected to server as ${username}`);
      } else {
        console.warn(
          "Username not found in sessionStorage. Redirecting to login."
        );
        // Assuming you have a route '/auth/login':
        router.push("/auth/login"); // Redirect if no username is found.
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      // Optionally handle connection errors, e.g., display a message to the user, retry connection, etc.
      if (error.message === "Invalid token provided by user") {
        // Example: Handle invalid token
        sessionStorage.removeItem("token"); // Clear invalid token
        sessionStorage.removeItem("username");
        router.push("/auth/login"); // Redirect to login
      }
    });
    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
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
      const newToken = sessionStorage.getItem("token");
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
