"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@chakra-ui/react";

enum GameState {
  WAITING = "waiting",
  IN_PROGRESS = "in_progress",
  GAME_OVER = "game_over",
}

interface Game {
  gameId: string;
  startAt: string;
  endAt?: string;
  state: GameState;
  winnerPlayer?: {
    username: string;
  };
}

export default function Component() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const username = sessionStorage.getItem("username");

        if (!token || !username) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/games/history?username=${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch games history.");
        } else {
          const data = await response.json();
          setGames(data);
        }
      } catch (err) {
        setError("An error occurred while fetching games.");
        console.error("Error fetching games history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center h-screen bg-gray-900 text-blue-300 font-orbitron">
        <Box className="animate-pulse">Loading games history...</Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex items-center justify-center h-screen bg-gray-900 text-red-400 font-orbitron">
        <Box>Error: {error}</Box>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gray-900 text-blue-300 font-orbitron p-8">
      <Box className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-100">
          Your Games History
        </h1>
        {games.length === 0 ? (
          <Box className="text-center text-gray-400">No past games found.</Box>
        ) : (
          <Box className="grid gap-6 md:grid-cols-2">
            {games.map((game) => (
              <Box
                key={game.gameId}
                className="bg-gray-800 p-6 rounded-lg shadow-lg border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
              >
                <h3 className="text-xl font-semibold mb-2 text-blue-200">
                  Game #{game.gameId}
                </h3>
                <Box className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-400">Started:</span>{" "}
                    {formatDate(game.startAt)}
                  </p>
                  <p>
                    <span className="text-gray-400">Ended:</span>{" "}
                    {game.endAt ? formatDate(game.endAt) : "N/A"}
                  </p>
                  <p>
                    <span className="text-gray-400">Status:</span>{" "}
                    <span
                      className={`font-medium ${
                        game.state === GameState.GAME_OVER
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {game.state}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Winner:</span>{" "}
                    <span className="font-medium text-purple-400">
                      {game.winnerPlayer
                        ? game.winnerPlayer.username
                        : game.state === GameState.GAME_OVER
                        ? "Inconclusive"
                        : "Game in progress"}
                    </span>
                  </p>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
