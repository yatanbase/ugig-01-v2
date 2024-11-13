// components/SocketProvider.tsx
"use client";
import { createContext, useEffect, useMemo, useRef, useState } from "react";
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
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();
  const isConnected = useRef(false);

  useEffect(() => {
    // Main useEffect for connection setup and cleanup
    const storedToken = sessionStorage.getItem("token");

    if (storedToken && !isConnected.current) {
      // Only connect if not already connected
      const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/game`, {
        extraHeaders: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      newSocket.on("connect", () => {
        isConnected.current = true; // Set connected AFTER successful connection
        const username = sessionStorage.getItem("username");
        if (username) {
          console.log(`Connected to server as ${username}`);
        } else {
          console.warn(
            "Username not found in sessionStorage. Redirecting to login."
          );
          router.push("/auth/login"); // Redirect if no username is found.
        }
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        if (error.message === "Invalid token provided by user") {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("username");
          router.push("/auth/login");
        }
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    }

    return () => {
      // Cleanup function
      if (socketRef.current) {
        // Only disconnect if connected
        socketRef.current.disconnect();
        isConnected.current = false;
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [router]); // Only re-run if the router changes

  const value = useMemo(
    () => ({ socket: socketRef.current }),
    [socketRef.current]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };

//  useEffect(() => {
//    createSocketConnection(token); // Create connection (or disconnect if token is null)

//    return () => {
//      socket?.disconnect();
//      socketRef.current = null;
//      setSocket(null);
//    };
//  }, [token]);

//  useEffect(() => {
//    const handleStorageChange = () => {
//      const newToken = sessionStorage.getItem("token");
//      console.log("newToken", newToken);

//      setToken(newToken);
//    };

//    window.addEventListener("storage", handleStorageChange);

//    return () => {
//      window.removeEventListener("storage", handleStorageChange);
//    };
//  }, []);
