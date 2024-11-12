// src/components/OnlineUserList.tsx
"use client";
import { useEffect, useState, useContext } from "react";

import { Box, VStack, Text, Heading, HStack, Button } from "@chakra-ui/react";
import { SocketContext } from "../ui/SocketProvider";
interface OnlineUserProps {
  onlineUsers: string[];
  handleInvite: (username: string) => void; // Add handleInvite prop
}

const OnlineUserList: React.FC = () => {
  const { socket } = useContext(SocketContext);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
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

  return (
    <Box>
      <VStack rowGap={4} align="center">
        <Heading as="h2" size="lg">
          Online Users
        </Heading>

        <VStack rowGap={2} align="start">
          {onlineUsers.length > 0 ? (
            onlineUsers.map((user) => <Text key={user}>{user}</Text>)
          ) : (
            <Text>No users online</Text>
          )}
        </VStack>
      </VStack>
    </Box>
    // <Box>
    //   <VStack rowGap={4} align="center">
    //     <Heading as="h2" size="lg">
    //       Online Users
    //     </Heading>

    //     <VStack rowGap={2} align="start">
    //       {onlineUsers.length > 0 ? (
    //         onlineUsers.map((user) => (
    //           <HStack key={user} justifyContent="space-between" width="200px">
    //             {" "}
    //             {/* Use HStack and add Button */}
    //             <Text>{user}</Text>
    //             <Button
    //               onClick={() => handleInvite(user)}
    //               disabled={user === localStorage.getItem("username")}
    //             >
    //               Invite
    //             </Button>{" "}
    //             {/* Button to send invite */}
    //           </HStack>
    //         ))
    //       ) : (
    //         <Text>No other users online</Text>
    //       )}
    //     </VStack>
    //   </VStack>
    // </Box>
  );
};

export default OnlineUserList;
