// src/components/OnlineUserList.tsx
"use client";
import { useEffect, useState, useContext } from "react";

import { Box, VStack, Text, Heading, HStack, Button } from "@chakra-ui/react";
import { SocketContext } from "../ui/SocketProvider";
interface OnlineUserProps {
  onlineUsers: string[];
  inGame: boolean;
  // handleInvite: (username: string) => void; // Add handleInvite prop
}

const OnlineUserList: React.FC<OnlineUserProps> = ({ onlineUsers, inGame }) => {
  const { socket } = useContext(SocketContext);
  console.log("onlineuserslist socket", socket);
  // const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null); // State for invite status

  const handleInvite = (username: string) => {
    console.log("handle invite");
    if (socket) {
      // Emit the "sendInvite" event over the socket with the username
      console.log("socket before sending invite", username);

      socket.emit("sendInvite", { to: username });
      console.log(`Invite sent successfully from client side to ${username}`);
    }
  };

  useEffect(() => {
    if (socket) {
      // socket.on("connect", () => {
      //   socket.emit("getOnlineUsers"); // Get initial user list
      // });

      // socket.on("updateUserList", (users: any) => {
      //   setOnlineUsers(users);
      // });

      socket.on(
        "inviteResponse",
        (response: { success: boolean; message: string }) => {
          if (response.success) {
            setInviteStatus(`Invite sent successfully to ${response.message}`);
          } else {
            setInviteStatus(`Failed to send invite: ${response.message}`);
          }
        }
      );
      socket.on("receiveInvite", (data) => {
        console.log("pohoch gaye but andar");
        console.log("Received invite from:", data.from);
        // setReceivedInvite(data); // Set receivedInvite state
        // toaster.create({
        //   title: `Received invite from ${data.from}`,
        //   type: "info",
        //   duration: 10000,
        // });
      });
      const handleAnyEvent = (event: any, ...args: any) => {
        console.log(`Received event: ${event}`, args);
      };

      socket.onAny(handleAnyEvent);

      return () => {
        socket.off("connect");
        socket.offAny(handleAnyEvent);

        socket.off("updateUserList");
        socket.off("inviteResponse");
      };
    }
  }, [socket]);

  return (
    <Box>
      <VStack rowGap={4} align="center">
        <Heading as="h2" size="lg">
          Online Users
        </Heading>
        <VStack rowGap={2} align="start">
          {!inGame && onlineUsers.length > 0
            ? onlineUsers.map((user) => (
                <HStack key={user} justify="space-between" width="100%">
                  {/* Display the username */}
                  <Text>{user}</Text>

                  {/* Invite button */}
                  <Button
                    disabled={user === sessionStorage.getItem("username")}
                    className={`px-3 py-1 ${
                      user === sessionStorage.getItem("username")
                        ? "bg-gray-400 text-white"
                        : "bg-white text-black"
                    }`}
                    onClick={() => handleInvite(user)}
                  >
                    Invite
                  </Button>
                </HStack>
              ))
            : !inGame && <Text>No users online</Text>}
          {inGame &&
            onlineUsers.map((user) => (
              <HStack key={user} justify="space-between" width="100%">
                {/* Display the username */}
                <Text>{user}</Text>

                {/* Green Circle */}
                <Box
                  className="w-3 h-3 rounded-full bg-green-500"
                  title="In Game"
                ></Box>
              </HStack>
            ))}
        </VStack>
      </VStack>
    </Box>
  );
};

export default OnlineUserList;
