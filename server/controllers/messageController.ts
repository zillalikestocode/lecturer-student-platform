import type { Request, Response } from "express";
import Chat from "../models/Chat";
import Message from "../models/Message";
import { getIO } from "../services/socketService";

// Send a new message in a chat
export const sendMessage = async (req: any, res: Response) => {
  const { content } = req.body;

  if (!content) {
    res.status(400).json({ message: "Message content is required" });
    return;
  }

  try {
    // Check if chat exists
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    // Check if user is a participant
    if (!chat.participants.includes(req.user._id)) {
      res
        .status(403)
        .json({ message: "Not authorized to send messages in this chat" });
      return;
    }

    // Create new message
    const newMessage = await Message.create({
      sender: req.user._id,
      content,
      chat: chat._id,
    });

    // Update latest message in chat
    chat.latestMessage = newMessage._id as any;
    await chat.save();

    // Populate sender information
    await newMessage.populate("sender", "name role");

    // Emit message via Socket.IO
    try {
      const io = getIO();
      io.to((chat._id as any).toString()).emit("new_message", newMessage);
    } catch (socketError) {
      console.error("Socket.IO emission error:", socketError);
      // Continue with response even if socket emission fails
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get paginated message history for a chat
export const getMessages = async (req: any, res: Response) => {
  try {
    const chatId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Check if chat exists and user is a participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    if (!chat.participants.includes(req.user._id)) {
      res
        .status(403)
        .json({ message: "Not authorized to access this chat's messages" });
      return;
    }

    // Get messages for this chat with pagination
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Message.countDocuments({ chat: chatId });

    // Return messages in ascending order for display (oldest first)
    res.json({
      messages: messages.reverse(),
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search messages in a chat
export const searchMessages = async (req: any, res: Response) => {
  try {
    const chatId = req.params.id;
    const searchQuery = req.query.q as string;

    if (!searchQuery) {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    // Check if chat exists and user is a participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    if (!chat.participants.includes(req.user._id)) {
      res.status(403).json({ message: "Not authorized to access this chat" });
      return;
    }

    // Search messages using regex
    const messages = await Message.find({
      chat: chatId,
      content: { $regex: searchQuery, $options: "i" }, // case-insensitive search
    })
      .populate("sender", "name email role")
      .sort({ createdAt: 1 });

    res.json({
      query: searchQuery,
      results: messages,
      count: messages.length,
    });
  } catch (error) {
    console.error("Error searching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};
