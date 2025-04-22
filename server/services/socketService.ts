import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Chat from "../models/Chat";
import Message from "../models/Message";

// Create a variable to hold the io instance
let io: Server;

export const setupSocketIO = (server: http.Server) => {
  io = new Server(server, {
    cors: { origin: "https://lecturer-student.vercel.app" },
  });

  // Socket.IO setup with authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-default-jwt-secret"
      ) as { id: string };
      socket.data.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    const user = socket.data.user;

    // Handle user joining with verified identity
    if (user) {
      console.log(`Authenticated user connected: ${user.name} (${user._id})`);

      // Join user's personal room for direct messages
      socket.join(user._id.toString());
    }

    // Handle joining chat rooms
    socket.on("join_chat", (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${user?._id} joined chat ${chatId}`);
    });

    // Handle sending messages - now authentication is handled via socket middleware
    socket.on(
      "send_message",
      async ({ chatId, content }: { chatId: string; content: string }) => {
        if (!user) return;

        try {
          // Verify chat exists and user is a participant
          const chat = await Chat.findById(chatId);
          if (!chat || !chat.participants.includes(user._id)) {
            return;
          }

          // Create new message
          const newMessage = await Message.create({
            sender: user._id,
            content,
            chat: chatId,
          });

          // Update latest message in chat
          chat.latestMessage = newMessage._id as any;
          await chat.save();

          // Populate sender details
          await newMessage.populate("sender", "name role");

          // Send to all users in the chat room
          io.to(chatId).emit("new_message", newMessage);
        } catch (error) {
          console.error("Socket message error:", error);
        }
      }
    );

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Export the io instance for use in other files
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
