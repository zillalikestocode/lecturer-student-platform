"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Chat } from "../types";
import { chatService } from "../services/api";

interface UseChatsOptions {
  currentUser: User;
}

export function useChats({ currentUser }: UseChatsOptions) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get chat by id
  const getChat = useCallback(
    async (chatId: string) => {
      try {
        const data = await chatService.getChat(currentUser?.token!, chatId);
        return data;
      } catch (err) {
        return null;
      }
    },
    [currentUser?.token]
  );

  // Fetch all chats
  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await chatService.getChats(currentUser?.token!);
      setChats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load chats");
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.token]);

  // Create a new chat
  const createChat = useCallback(
    async (name: string, participants: string[]) => {
      try {
        setLoading(true);
        setError(null);

        const newChat = await chatService.createChat(currentUser.token!, {
          name,
          participants,
        });

        setChats((prevChats) => [...prevChats, newChat]);
        return newChat;
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to create chat");
        console.error("Error creating chat:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [currentUser?.token]
  );

  // Function to create a chat with a lecturer
  const createLecturerChat = async (lecturerId: string) => {
    try {
      setError(null);

      const userString = localStorage.getItem("user");
      if (!userString) {
        throw new Error("Authentication required");
      }

      const user = JSON.parse(userString);
      const newChat = await chatService.createLecturerChat(
        user.token,
        lecturerId
      );

      // Update chats to include the new one
      setChats((prevChats) => {
        if (prevChats.find((chat) => chat._id === newChat._id)) {
          return prevChats; // Chat already exists
        }
        return [newChat, ...prevChats];
      });

      return newChat;
    } catch (error) {
      console.error("Error creating lecturer chat:", error);
      setError("Failed to create chat with lecturer");
      return null;
    }
  };

  // Accept invite
  const acceptInvite = useCallback(
    async (chatId: string) => {
      try {
        const data = await chatService.acceptInvite(currentUser.token!, chatId);

        if (data.success) {
          return true;
        }
        return false;
      } catch (err) {
        return false;
      }
    },
    [currentUser?.token]
  );

  // Delete a chat
  const deleteChat = useCallback(
    async (chatId: string) => {
      try {
        setLoading(true);
        setError(null);

        await chatService.deleteChat(currentUser.token!, chatId);

        if (currentChat?._id === chatId) {
          setCurrentChat(null);
        }

        setChats((prevChats) =>
          prevChats.filter((chat) => chat._id !== chatId)
        );

        return true;
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete chat");
        console.error("Error deleting chat:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [currentChat, currentUser?.token]
  );

  // Select a chat to display
  const selectChat = useCallback((chat: Chat) => {
    setCurrentChat(chat);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const clearError = () => setError(null);

  return {
    chats,
    currentChat,
    loading,
    error,
    fetchChats,
    createChat,
    createLecturerChat,
    deleteChat,
    selectChat,
    acceptInvite,
    getChat,
    clearError,
  };
}
