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
import { useEffect, useState, useContext, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameGrid from "../../components/ui/Grid";
import OnlineUsersList from "../../components/ui/OnlineUsersList";
import Confetti from "react-confetti";
import { Socket } from "socket.io-client";
import {
  SocketContext,
  SocketProvider,
} from "../../components/ui/SocketProvider";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useRouter } from "next/navigation";

import { Toaster, toaster } from "@/components/ui/toaster";
import Image from "next/image";

export default function InsidePlay() {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLosingGraphic, setShowLosingGraphic] = useState(false);
  const confettiRef = useRef<any>(null); // Ref for confetti canvas
  const [gameId, setGameId] = useState<number | null>(null);
  const [isSelector, setIsSelector] = useState(false);
  const [isPredictor, setIsPredictor] = useState(false);
  const [isPredictionEnabled, setIsPredictionEnabled] = useState(false);
  const [disabledCells, setDisabledCells] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({}); // State for scores
  const [prevScores, setPrevScores] = useState<Record<string, number>>({});
  const [animateScores, setAnimateScores] = useState<Record<string, boolean>>(
    {}
  );

  //check for token through useEffect in session storage and redirect to login if not found

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
  const [init, setInit] = useState(false);

  const [inviteSent, setInviteSent] = useState(false); // Track invite status
  const [receivedInvite, setReceivedInvite] = useState<
    | {
        from: string;
      }
    | undefined
  >(undefined);
  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/auth/login");
    }
  }, [router]);

  const { socket } = useContext(SocketContext);
  useEffect(() => {
    // useEffect for Confetti and Graphic Cleanup
    return () => {
      setShowConfetti(false); // Hide confetti on component unmount
      setShowLosingGraphic(false); // Hide losing graphic on component unmount
    };
  }, []);
  console.log("play page socket", socket);
  useEffect(() => {
    console.log("disabledCells", disabledCells);
  }, [disabledCells]);
  useEffect(() => {
    // Initialize the particle engine
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);
  const particlesOptions = useMemo(
    () => ({
      fullScreen: {
        enable: true,
        zIndex: -1,
      },
      background: {
        color: {
          value: "#000000", // Very dark background
        },
      },
      fpsLimit: 60,
      particles: {
        number: {
          value: 100,
          density: {
            enable: true,
            value_area: 1000,
          },
        },
        color: {
          value: ["#ffffff", "#87ceeb"], // White and light blue for stars
        },
        shape: {
          type: "circle",
        },
        opacity: {
          value: 0.8,
          random: true,
          animation: {
            enable: true,
            speed: 0.1,
            minimumValue: 0.1,
            sync: false,
          },
        },
        size: {
          value: 2,
          random: true,
          animation: {
            enable: true,
            speed: 1,
            minimumValue: 0.1,
            sync: false,
          },
        },
        move: {
          enable: true,
          speed: 0.3, // Slower movement
          direction: "none",
          random: true,
          straight: false,
          outModes: {
            default: "out",
          },
        },
        twinkle: {
          particles: {
            enable: true,
            frequency: 0.05,
            opacity: 1,
          },
        },
      },
      particles2: {
        // Meteor shower effect
        number: {
          value: 2,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: "#ffffff",
        },
        shape: {
          type: "line",
        },
        size: {
          value: { min: 0.1, max: 1 },
        },
        move: {
          enable: true,
          speed: 15,
          direction: "bottom-right",
          straight: true,
          outModes: "out",
        },
        life: {
          duration: {
            sync: true,
            value: 1,
          },
          count: 1,
        },
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "bubble",
          },
        },
        modes: {
          bubble: {
            distance: 100,
            size: 3,
            duration: 2,
            opacity: 0.8,
          },
        },
      },
      detectRetina: true,
    }),
    []
  );

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
        const username = sessionStorage.getItem("username");
        console.log("username", username);
        if (data.winner === sessionStorage.getItem("username")) {
          setShowConfetti(true);
          toaster.create({
            title: `${username?.toUpperCase()}  won!`,
            description: `Final scores: ${JSON.stringify(data.scores)}`,
            type: "success",
            duration: 5000,
          });
        } else {
          setShowLosingGraphic(true);
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

        // toaster.create({
        //   title: `${data.username}'s prediction is ${
        //     data.isCorrect ? "correct" : "incorrect"
        //   }`,
        //   type: data.isCorrect ? "success" : "error",
        //   duration: 1000,
        // });

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
  useEffect(() => {
    const newAnimateScores: Record<string, boolean> = {};
    Object.keys(scores).forEach((username) => {
      if (scores[username] !== prevScores[username]) {
        newAnimateScores[username] = true;
      }
    });
    setAnimateScores(newAnimateScores);
    setPrevScores(scores);

    const timer = setTimeout(() => {
      setAnimateScores({});
    }, 1000);

    return () => clearTimeout(timer);
  }, [scores, prevScores]);
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

  const containerStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #0b1120 0%, #161e2e 100%)", // Even darker gray-blue
    minHeight: "100vh",
    color: "#e2e8f0", // Soft off-white for text
    fontFamily: "var(--font-orbitron), sans-serif",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    zIndex: 1,
  };

  const headingStyle: React.CSSProperties = {
    fontSize: "2rem",
    textAlign: "center",
    marginBottom: "2rem",
    textTransform: "uppercase",
    letterSpacing: "3px",
    textShadow: "0 0 10px rgba(226, 232, 240, 0.8)", // Soft glow effect
    color: "#a3bffa", // Muted pastel blue
  };

  const buttonStyle: React.CSSProperties = {
    background: "#38bdf8", // Soft teal
    color: "#f8fafc", // Near-white text
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontFamily: "var(--font-orbitron), sans-serif",
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: "14px",
    letterSpacing: "1px",
    boxShadow: "0 4px 8px rgba(56, 189, 248, 0.4)", // Subtle glow
    transition: "all 0.3s ease",
  };

  const textStyle: React.CSSProperties = {
    fontSize: "1rem",
    textAlign: "center",
    marginBottom: "1rem",
    color: "#94a3b8", // Muted gray for secondary text
  };

  const scoreStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "500px",
    padding: "10px",
    borderRadius: "5px",
    background: "rgba(255, 255, 255, 0.05)", // Transparent white for subtle contrast
    color: "#e2e8f0", // Off-white for text
    marginBottom: "10px",
  };

  const username = sessionStorage.getItem("username") || "";
  const opponent = Object.keys(scores).find((name) => name !== username) || "";
  return (
    <div style={containerStyle} ref={confettiRef}>
      {init && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -1,
          }}
        >
          <Particles id="tsparticles" options={particlesOptions} />
        </div>
      )}
      {showConfetti && (
        <Confetti
          width={confettiRef.current?.offsetWidth}
          height={confettiRef.current?.offsetHeight}
          recycle={true}
          numberOfPieces={100}
        />
      )}

      {showLosingGraphic && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.8)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Image
            src="/losing.gif"
            alt="Better luck next time!"
            width={200}
            height={200}
            objectFit="contain"
          />
          <p
            style={{
              color: "#ffa500",
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginTop: "1rem",
              animation: "pulse 2s infinite",
            }}
          >
            Better luck next time!
          </p>
        </div>
      )}

      {!roomId && (
        <>
          <OnlineUsersList onlineUsers={onlineUsers} inGame={false} />
          {receivedInvite && (
            <button style={buttonStyle} onClick={handleAcceptInvite}>
              Accept Invite from {receivedInvite.from}
            </button>
          )}
        </>
      )}

      {roomId && gameId && (
        <>
          <h2 style={headingStyle}>
            Room: {roomId} | Game: {gameId}
          </h2>

          {/* Opponent's score */}
          <div style={scoreStyle}>
            <span>{opponent}</span>
            <AnimatePresence>
              {animateScores[opponent] && (
                <motion.span
                  key={`${opponent}-score`}
                  initial={{ scale: 1.5, color: "#4caf50" }}
                  animate={{ scale: 1, color: "#e94560" }}
                  exit={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {scores[opponent]}
                </motion.span>
              )}
            </AnimatePresence>
            {!animateScores[opponent] && <span>{scores[opponent]}</span>}
          </div>

          <GameGrid
            handleCellClick={handleCellClick}
            selectedCells={selectedCells}
            isSelector={isSelector}
            isPredictor={isPredictor}
            disabledCells={disabledCells}
            isPredictionEnabled={isPredictionEnabled}
            gameId={gameId}
          />

          {/* Player's score */}
          <div style={scoreStyle}>
            <span>{username}</span>
            <AnimatePresence>
              {animateScores[username] && (
                <motion.span
                  key={`${username}-score`}
                  initial={{ scale: 1.5, color: "#4caf50" }}
                  animate={{ scale: 1, color: "#e94560" }}
                  exit={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {scores[username]}
                </motion.span>
              )}
            </AnimatePresence>
            {!animateScores[username] && <span>{scores[username]}</span>}
          </div>

          {isSelector && (
            <>
              <p style={{ ...textStyle, color: "#4caf50" }}>
                You are the Selector
              </p>
              <button style={buttonStyle}>Select a cell</button>
            </>
          )}
          {isPredictor && (
            <>
              <p style={{ ...textStyle, color: "#2196f3" }}>
                You are the Predictor
              </p>
              {!isPredictionEnabled ? (
                <p style={textStyle}>Waiting for selector...</p>
              ) : (
                <p style={textStyle}>You can Predict now</p>
              )}
            </>
          )}
          <OnlineUsersList onlineUsers={onlineUsers} inGame={true} />
        </>
      )}

      {!roomId && !gameId && (
        <p style={textStyle}>Waiting to Create or Join a room...</p>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
