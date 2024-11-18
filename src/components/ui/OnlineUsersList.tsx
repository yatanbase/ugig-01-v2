"use client";

import { useEffect, useState, useContext } from "react";
import { SocketContext } from "../ui/SocketProvider";

interface OnlineUserProps {
  onlineUsers: string[];
  inGame: boolean;
}

export default function Component({ onlineUsers, inGame }: OnlineUserProps) {
  const { socket } = useContext(SocketContext);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);

  const handleInvite = (username: string) => {
    if (socket) {
      socket.emit("sendInvite", { to: username });
      console.log(`Invite sent successfully from client side to ${username}`);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on(
        "inviteResponse",
        (response: { success: boolean; message: string }) => {
          if (response.success) {
            setInviteStatus(`Invite sent successfully`);
          } else {
            setInviteStatus(`Failed to send invite`);
          }
        }
      );

      socket.on("receiveInvite", (data) => {
        console.log("Received invite from:", data.from);
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
    <div
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: "15px",
        padding: "20px",
        color: "#94a3b8",
        fontFamily: "'Orbitron', sans-serif",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          fontSize: "20px",
          textAlign: "center",
          marginBottom: "20px",
          textTransform: "uppercase",
          letterSpacing: "2px",
          color: "#e2e8f0",
        }}
      >
        Online Players
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {!inGame && onlineUsers.length > 0 ? (
          onlineUsers.map((user) => (
            <div
              key={user}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "10px 15px",
                borderRadius: "8px",
                transition: "all 0.3s ease",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#e2e8f0",
                }}
              >
                {user}
              </span>
              <button
                disabled={user === sessionStorage.getItem("username")}
                onClick={() => handleInvite(user)}
                style={{
                  background:
                    user === sessionStorage.getItem("username")
                      ? "#4a5568"
                      : "#3182ce",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor:
                    user === sessionStorage.getItem("username")
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.3s ease",
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: "12px",
                  letterSpacing: "1px",
                }}
              >
                Invite
              </button>
            </div>
          ))
        ) : !inGame ? (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              color: "#e2e8f0",
            }}
          >
            No players online
          </div>
        ) : null}
        {inGame &&
          onlineUsers.map((user) => (
            <div
              key={user}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "10px 15px",
                borderRadius: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#e2e8f0",
                }}
              >
                {user}
              </span>
              <div
                title="In Game"
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#48bb78",
                  boxShadow: "0 0 5px #48bb78",
                }}
              ></div>
            </div>
          ))}
      </div >
      {inviteStatus && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            textAlign: "center",
            fontSize: "14px",
            color: "#e2e8f0",
          }}
        >
          {inviteStatus}
        </div>
      )}
    </div>
  );
}
