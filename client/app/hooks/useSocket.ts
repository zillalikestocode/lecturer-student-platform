import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    // Only establish connection if we have a user with a token
    if (!currentUser?.token) {
      return;
    }

    // Create socket connection
    const socketInstance = io("https://lecturere-api.emmanuelngoka.work", {
      auth: {
        token: currentUser.token,
      },
    });

    // Set up event handlers
    socketInstance.on("connect", () => {
      console.log("Socket.IO connected!");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket.IO disconnected!");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      setIsConnected(false);
    });

    // Store socket in state
    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [currentUser?.token]);

  // Join a specific chat room
  const joinChat = (chatId: string) => {
    if (socket && isConnected && chatId) {
      socket.emit("join_chat", chatId);
      console.log(`Joined chat room: ${chatId}`);
    }
  };

  return { socket, isConnected, joinChat };
};
