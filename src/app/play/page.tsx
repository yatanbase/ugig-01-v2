// src/app/play/page.tsx
"use client";
import { Box, Container, VStack } from "@chakra-ui/react";
import { io } from "socket.io-client";
import { useEffect, useState, useContext } from "react";
import GameGrid from "../../components/ui/Grid";
import OnlineUsersList from "../../components/ui/OnlineUsersList";
import { SocketContext } from "../../components/ui/SocketProvider";

export default function Play() {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<Record<string, string>>(
    {}
  );

  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("Connected to server");
        socket.emit("getOnlineUsers"); // Get initial user list
      });

      socket.on("updateUserList", (users: any) => {
        setOnlineUsers(users);
      });

      socket.on("cellSelected", (data: any) => {
        console.log(`Client ${data.username} selected cell ${data.cell}`);

        setSelectedCells((prev) => ({ ...prev, [data.cell]: data.username }));
      });

      return () => {
        socket.off("connect");
        socket.off("updateUserList");
        socket.off("cellSelected");
      };
    }
  }, [socket]);

  const handleCellClick = (cell: string) => {
    if (socket) {
      socket.emit("selectCell", cell);
      console.log("Cell clicked:", cell);
    }
  };

  return (
    <Box>
      <Container maxW="container.xl" centerContent>
        <VStack rowGap={8} align="center">
          <GameGrid
            handleCellClick={handleCellClick}
            selectedCells={selectedCells}
          />
          <OnlineUsersList />
        </VStack>
      </Container>
    </Box>
  );
}
