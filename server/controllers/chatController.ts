import type { Request, Response } from "express";
import Chat from "../models/Chat";
import Message from "../models/Message";
import User from "../models/User";

// Get all chats for current user
export const getUserChats = async (req: any, res: Response) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate("participants", "name email role")
      .populate("latestMessage");

    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific chat by ID with messages
export const getChatById = async (req: any, res: Response) => {
  try {
    const chat = await Chat.findById(req.params.id).populate(
      "participants",
      "name email role"
    );

    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    // Check if user is a participant in this chat
    // if (
    //   !chat.participants.some(
    //     (p) => (p as any)._id.toString() === req.user._id.toString()
    //   )
    // ) {
    //   res.status(403).json({ message: "Access denied" });
    //   return;
    // }

    // Fetch messages for this chat
    const messages = await Message.find({ chat: chat._id })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    res.json({
      _id: chat._id,
      name: chat.name,
      participants: chat.participants,
      isGroupChat: chat.isGroupChat,
      messages,
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new chat
export const createChat = async (req: any, res: Response) => {
  const { name, participants } = req.body;

  if (!name || !participants || !Array.isArray(participants)) {
    res.status(400).json({ message: "Invalid chat data" });
    return;
  }

  // Add current user to participants if not already included
  if (!participants.includes(req.user._id.toString())) {
    participants.push(req.user._id.toString());
  }

  try {
    // Create new chat
    const newChat = await Chat.create({
      name,
      participants,
      isGroupChat: participants.length > 2,
    });

    // Populate and return the new chat
    const fullChat = await Chat.findById(newChat._id).populate(
      "participants",
      "name email role"
    );

    res.status(201).json(fullChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a chat
export const deleteChat = async (req: any, res: Response) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    // Ensure user is a participant
    if (!chat.participants.includes(req.user._id)) {
      res.status(403).json({ message: "Not authorized to delete this chat" });
      return;
    }

    // Delete the chat and associated messages
    await Message.deleteMany({ chat: chat._id });
    await Chat.deleteOne({ _id: chat._id });

    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export chat history
export const exportChatHistory = async (req: any, res: Response) => {
  try {
    const chatId = req.params.id;

    // Check if chat exists and user is a participant
    const chat = await Chat.findById(chatId).populate(
      "participants",
      "name email role"
    );
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    if (
      !chat.participants.some(
        (p) => (p as any)._id.toString() === req.user._id.toString()
      )
    ) {
      res.status(403).json({ message: "Not authorized to access this chat" });
      return;
    }

    // Get all messages for this chat
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email role")
      .sort({ createdAt: 1 });

    // Format data for export
    const exportData = {
      chatName: chat.name,
      exportDate: new Date(),
      exportedBy: req.user.name,
      participants: chat.participants.map((p: any) => ({
        name: p.name,
        email: p.email,
        role: p.role,
      })),
      messages: messages.map((msg) => ({
        sender: (msg.sender as any).name,
        role: (msg.sender as any).role,
        content: msg.content,
        timestamp: msg.createdAt,
      })),
    };

    res.json(exportData);
  } catch (error) {
    console.error("Error exporting chat history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const acceptParticipant = async (req: Request, res: Response) => {
  const chatId = req.params.chatId;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }
    if (chat.participants.includes(req.user._id)) {
      res.status(200).json({ success: true });
      return;
    }

    chat.participants = [...chat.participants, req.user._id];
    await chat.save();

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
