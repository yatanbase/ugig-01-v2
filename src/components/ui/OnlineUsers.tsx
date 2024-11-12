// components/OnlineUsers.tsx
"use client";

import { useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "../ui/SocketProvider";
import { Box, VStack, Text, Heading, Button } from "@chakra-ui/react";
import { Pixelify_Sans } from "next/font/google";

const pixelify = Pixelify_Sans({ subsets: ["latin"] });

const OnlineUsers: React.FC = () => {
  const { socket } = useContext(SocketContext);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  // const [socket, setSocket] = useState<any>(null);

  // const emitted = false;
  // useEffect(() => {
  //   const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/game`);
  //   setSocket(newSocket);

  //   return () => {
  //     if (newSocket) {
  //       newSocket.disconnect();
  //     }
  //   };
  // }, []);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("Connected to server");
        socket.emit("getOnlineUsers"); // Get initial user list
      });

      socket.on("updateUserList", (users: any) => {
        setOnlineUsers(users);
      });

      return () => {
        socket.off("connect");
        socket.off("updateUserList");
      };
    }
  }, [socket]);

  const textColor = "teal.500"; // Set a static text color

  return (
    <VStack rowGap={4} align="center">
      <Heading
        as="h2"
        fontSize="xl"
        color={textColor}
        className={pixelify.className}
      >
        Online Players: {onlineUsers.length}
      </Heading>
    </VStack>
  );
};

export default OnlineUsers;
