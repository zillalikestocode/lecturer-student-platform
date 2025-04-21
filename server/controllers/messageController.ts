import { Request, Response } from "express";
import Chat from "../models/Chat";
import Message from "../models/Message";

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

    // Update chat's latest message
    chat.latestMessage = newMessage._id as any;
    await chat.save();

    // Populate sender information
    await newMessage.populate("sender", "name role");

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
      res.status(403).json({ message: "Not authorized to access this chat" });
      return;
    }

    // Get total count for pagination
    const totalMessages = await Message.countDocuments({ chat: chatId });

    // Fetch messages with pagination
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email role")
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first when displaying
      pagination: {
        total: totalMessages,
        page,
        pages: Math.ceil(totalMessages / limit),
        hasMore: skip + messages.length < totalMessages,
      },
    });
  } catch (error) {
    console.error("Error fetching message history:", error);
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
