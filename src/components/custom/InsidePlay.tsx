"use client";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
// import { io } from "socket.io-client";
import { useEffect, useState, useContext } from "react";
import GameGrid from "../../components/ui/Grid";
import OnlineUsersList from "../../components/ui/OnlineUsersList";
import { Socket } from "socket.io-client";
import {
  SocketContext,
  SocketProvider,
} from "../../components/ui/SocketProvider";

import { Toaster, toaster } from "@/components/ui/toaster";

export default function InsidePlay() {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);

  const [selectedCells, setSelectedCells] = useState<Record<string, string>>(
    {}
  );
  const [inviteSent, setInviteSent] = useState(false); // Track invite status
  const [receivedInvite, setReceivedInvite] = useState<
    | {
        from: string;
      }
    | undefined
  >(undefined);

  const { socket } = useContext(SocketContext);

  console.log("play page socket", socket);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("Connected to server");
        socket.emit("getOnlineUsers"); // Get initial user list
      });
      socket.on("updateUserList", (users: any) => {
        setOnlineUsers(users);
      });
      const handleAnyEvent = (event: any, ...args: any) => {
        console.log(`Received event: ${event}`, args);
      };

      socket.onAny(handleAnyEvent);
      socket.on("updateUserList", (users: any) => {
        const otherUsers = users.filter(
          (user: any) => user !== localStorage.getItem("username")
        );
        setOnlineUsers(otherUsers); // Update state with other users
      });
      // socket.on("joinedRoom", (data) => {
      //   setRoomId(data.roomId);
      //   console.log("Joined room:", data.roomId);
      // });
      socket.on("receiveInvite", (data) => {
        console.log("pohoch gaye");
        console.log("Received invite from:", data);
        setReceivedInvite(data); // Set receivedInvite state
        toaster.create({
          title: `Received invite from ${data.from}`,
          type: "info",
          duration: 10000,
        });
      });

      socket.on("joinRoom", (data) => {
        console.log("Joining room:", data.roomId);
        setRoomId(data.roomId); // Update roomId state
        handleJoinRoom(data.roomId); // Call handleJoinRoom to join the room on the frontend
      });
      socket.on("joinedRoom", (data) => {
        setRoomId(data.roomId);
        console.log("Joined room:", data.roomId);

        toaster.create({
          title: "Joined Room",
          description: `Room ID :  ${data.roomId}`,
          type: "info",
          duration: 9000,
        });
      });
      socket.on("cellSelected", (data: any) => {
        console.log(`client ${data.username} selected cell ${data.cell}`);

        setSelectedCells((prev) => ({ ...prev, [data.cell]: data.username }));
      });

      return () => {
        socket.off("connect");
        socket.off("updateUserList");
        socket.offAny(handleAnyEvent);
        socket.off("receiveInvite"); // Remove this listener too
        socket.off("joinedRoom");
        socket.off("joinRoom");
        socket.off("cellSelected");
      };
    }
  }, [socket, toaster]);

  // const handleInvite = (userToInvite: string) => {
  //   if (socket && localStorage.getItem("username")) {
  //     console.log('socket id before sending invite from /play', socket.id)
  //     console.log(`Sending invite to ${userToInvite}`);
  //     socket.emit("sendInvite", { to: userToInvite }); // Correct event name
  //     setInviteSent(true);
  //   }
  // };
  const handleAcceptInvite = () => {
    if (socket && receivedInvite) {
      console.log("Accepting invite from:", receivedInvite.from);
      socket.emit("acceptInvite", receivedInvite); // Emit acceptInvite with payload
    }
  };
  const handleJoinRoom = (roomId: string) => {
    if (socket) {
      console.log("Joining room", roomId);
      socket.emit("joinRoom", { roomId });
    }
  };

  const handleCellClick = (cell: string) => {
    if (socket && roomId) {
      socket.emit("selectCell", cell);
      console.log("Cell clicked:", cell);
    }
  };

  return (
    <Box>
      <Container maxW="container.xl" centerContent>
        <VStack rowGap={8} align="center">
          {/* Show user list if not in a room */}

          {!roomId && (
            <>
              <OnlineUsersList
                onlineUsers={onlineUsers}
                // handleInvite={handleInvite}
              />
              {receivedInvite && (
                <Button onClick={handleAcceptInvite}>
                  Accept Invite from {receivedInvite.from}
                </Button>
              )}
            </>
          )}

          {/* Conditionally render the rest based on roomId */}

          {roomId ? ( // Only show room details and game if in a room
            <>
              <Heading size="md">In Room: {roomId}</Heading>
              <GameGrid
                handleCellClick={handleCellClick}
                selectedCells={selectedCells}
              />
              <OnlineUsersList
                onlineUsers={onlineUsers}

                // handleInvite={handleInvite}
              />{" "}
              {/* Pass handleInvite */}
            </>
          ) : (
            <Text>Waiting to Create or Join a room...</Text>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
