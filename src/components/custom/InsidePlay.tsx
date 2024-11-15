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
import { useRouter } from "next/navigation";

import { Toaster, toaster } from "@/components/ui/toaster";

export default function InsidePlay() {
  const router = useRouter();
  const [gameId, setGameId] = useState<number | null>(null);
  const [isSelector, setIsSelector] = useState(false);
  const [isPredictor, setIsPredictor] = useState(false);
  const [isPredictionEnabled, setIsPredictionEnabled] = useState(false);
  const [disabledCells, setDisabledCells] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({}); // State for scores

  const [currentTurn, setCurrentTurn] = useState<{
    selector: string | null;
    predictor: string | null;
  }>({ selector: null, predictor: null });

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
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
    console.log("disabledCells", disabledCells);
  }, [disabledCells]);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("Connected to server");
        socket.emit("getOnlineUsers"); // Get initial user list
      });
      socket.on("updateUserList", (users: any) => {
        setOnlineUsers(users);
      });
      socket.on("gameOver", (data: { winner: string; scores: any }) => {
        console.log("Game Over!", data);
        if (data.winner === sessionStorage.getItem("username")) {
          toaster.create({
            title: "You won!",
            description: `Final scores: ${JSON.stringify(data.scores)}`,
            type: "success",
            duration: 5000,
          });
        } else {
          toaster.create({
            title: `${data.winner} won!`,
            description: `Final scores: ${JSON.stringify(data.scores)}`,
            type: "error", // or a different notification type
            duration: 10000,
          });
        }
      });
      socket.on("turn", (data: any) => {
        // Listen for 'turn' event

        console.log("data in on turn event client", data);
        const username = sessionStorage.getItem("username");

        setCurrentTurn(data);
        setGameId(data.gameId);
        setIsSelector(data.selector === username);
        setIsPredictor(data.predictor === username);
        setIsPredictionEnabled(false);
        setScores(data.scores);
        console.log(
          "[InsidePlay] isSelector:",
          isSelector,
          "isPredictor:",
          isPredictor,
          "scores:",
          scores
        );
        setDisabledCells(data.disabledCells);
      });
      socket.on("updateDisabledCells", (data: any) => {
        console.log("updating disabled cells", data);

        setDisabledCells(data.disabledCells);
      });
      socket.on("scoreUpdate", (updatedScores: Record<string, number>) => {
        setScores(updatedScores);
      });

      socket.on("predictionResult", (data: any) => {
        console.log("predictionResult received:", data); // Add this line

        toaster.create({
          title: `${data.username}'s prediction is ${
            data.isCorrect ? "correct" : "incorrect"
          }`,
          type: data.isCorrect ? "success" : "error",
          duration: 3000,
        });

        //  setSelectedCells((prev) => ({
        //    ...prev,
        //    [data.cell]: data.username,
        //  })); // update the selected cell here
      });
      socket.on("enablePrediction", (data: any) => {
        const username = sessionStorage.getItem("username");
        setIsPredictionEnabled(true);
        console.log("Prediction enabled for:", username);
        // setSelectedCells((prev) => ({
        //   ...prev,
        //   [data.cell]: data.selector,
        // }));
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
        setGameId(data.gameId);
        handleJoinRoom(data.roomId); // Call handleJoinRoom to join the room on the frontend
      });
      socket.on("joinedRoom", (data) => {
        setRoomId(data.roomId);
        setGameId(data.gameId);

        console.log("Joined room:", data.roomId, "gameId:", data.gameId);

        toaster.create({
          title: "Joined Room",
          description: `Room ID :  ${data.roomId}`,
          type: "info",
          duration: 5000,
        });
      });
      socket.on("cellSelected", (data: any) => {
        console.log(`client ${data.username} selected cell ${data.cell}`);

        if (data.username !== sessionStorage.getItem("username")) {
          // Check if it's NOT my selection
          // Don't update selectedCells if it's my own selection.
          // My selection is handled in the Grid component directly using selectedCellByMe
        } else {
          // setSelectedCells((prev) => ({ ...prev, [data.cell]: data.username })); // Only update for opponent's selection
        }
      });
      socket.on("cellPredicted", (data: any) => {
        // setSelectedCells((prev) => ({
        //   ...prev,
        //   [data.cell]: data.username,
        // }));
        setIsPredictionEnabled(false);
      });
      return () => {
        socket.off("connect");
        socket.off("updateUserList");
        socket.offAny(handleAnyEvent);
        socket.off("receiveInvite"); // Remove this listener too
        socket.off("joinedRoom");
        socket.off("joinRoom");
        socket.off("turn");
        socket.off("enablePrediction");
        socket.off("cellPredicted");
        socket.off("cellSelected");
        socket.off("gameOver");
        socket.off("updateDisabledCells");
        socket.off("scoreUpdate");
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
      const username = sessionStorage.getItem("username");
      if (isSelector && !isPredictionEnabled) {
        socket.emit("selectCell", { cell, roomId, username });
      } else if (isPredictor && isPredictionEnabled) {
        socket.emit("predictCell", { cell, roomId, username });
      }
    }
  };

  return (
    <Box>
      <Container maxW="container.xl" centerContent>
        <Toaster />
        <VStack rowGap={8} align="center">
          {/* Show user list if not in a room */}

          {!roomId && (
            <>
              <OnlineUsersList
                onlineUsers={onlineUsers}
                inGame={false}
                // handleInvite={handleInvite}
              />
              {receivedInvite && (
                <Button
                  className={`px-3 py-1 ${"bg-white text-black"}`}
                  onClick={handleAcceptInvite}
                >
                  Accept Invite from {receivedInvite.from}
                </Button>
              )}
            </>
          )}

          {/* Conditionally render the rest based on roomId */}

          {roomId && gameId ? ( // Only show room details and game if in a room
            <>
              <Heading size="md">
                In Room: {roomId}, Game ID: {gameId}
              </Heading>
              <GameGrid
                handleCellClick={handleCellClick}
                selectedCells={selectedCells}
                isSelector={isSelector}
                isPredictor={isPredictor}
                disabledCells={disabledCells}
                isPredictionEnabled={isPredictionEnabled}
                gameId={gameId}
              />
              {/* Example: Conditionally render a button only for the selector */}
              {isSelector && (
                <Text className={`px-3 py-1 ${" text-white"}`}>
                  {" "}
                  You are the<span className="text-green-600">
                    {" "}
                    Selector
                  </span>{" "}
                </Text>
              )}
              {isSelector && (
                <Button className={`px-3 py-1 ${"text-white"}`}>
                  Select a cell
                </Button>
              )}
              {/* Example: Display a message for the predictor */}
              {isPredictor && (
                <Text className={`px-3 py-1 ${" text-white"}`}>
                  {" "}
                  You are the<span className="text-blue-600">
                    {" "}
                    Predictor
                  </span>{" "}
                </Text>
              )}
              {isPredictor && !isPredictionEnabled ? (
                <p className={`px-3 py-1 ${"text-white"}`}>
                  Waiting for selector...
                </p>
              ) : (
                <p> You can Predict now</p>
              )}
              {/* Display scores */}
              <VStack rowGap={2} alignItems="center">
                {" "}
                {/* Center scores */}
                {Object.entries(scores).map(([username, score]) => (
                  <Text
                    key={username}
                    className={`px-3 py-1 ${"bg-white text-black"}`}
                  >
                    {username}: {score}
                  </Text>
                ))}
              </VStack>
              {/* <Text>
                temporarily diplaying participants with the same copmponent
              </Text> */}
              <OnlineUsersList
                onlineUsers={onlineUsers}
                inGame={true}
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
