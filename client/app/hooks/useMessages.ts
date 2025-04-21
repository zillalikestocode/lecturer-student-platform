"use client";

import { useState, useEffect, useCallback } from "react";
import { Message, User, Chat } from "../types";
import { messageService } from "../services/api";
import { useSocket } from "./useSocket";

interface UseMessagesOptions {
  chatId: string | null;
  currentUser: User;
  initialPage?: number;
  pageSize?: number;
}

export function useMessages({
  chatId,
  currentUser,
  initialPage = 1,
  pageSize = 20,
}: UseMessagesOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileAttachment, setFileAttachment] = useState<File | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    pages: 1,
    total: 0,
    hasMore: false,
  });

  // Use our Socket.IO hook
  const { socket, isConnected, joinChat } = useSocket();

  // Fetch messages for current chat
  const fetchMessages = useCallback(
    async (page = initialPage) => {
      if (!chatId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await messageService.getMessages(
          currentUser.token!,
          chatId,
          page,
          pageSize
        );

        setMessages(data.messages);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load messages");
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    },
    [chatId, currentUser?.token, initialPage, pageSize]
  );

  // Send a new message
  const sendMessage = useCallback(
    async (content: string, file: File | null = null) => {
      if ((!content.trim() && !file) || !chatId) return null;
      if (!currentUser?.token) return;

      // Create unique temp ID for optimistic update
      const tempId = `temp-${Date.now()}`;

      // Create optimistic message for immediate display
      const optimisticMessage: Message = {
        _id: tempId,
        sender: currentUser,
        content: content,
        chat: chatId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pending: true,
      };

      // Add to messages immediately (optimistic update)
      // if (content.trim()) {
      //   setMessages((prev) => [...prev, optimisticMessage]);
      // }

      try {
        setSending(true);
        setError(null);

        const response = await messageService.sendMessage(
          currentUser.token,
          chatId,
          content,
          file || undefined
        );

        // Replace optimistic message with actual message from server
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempId ? response : msg))
        );

        return response;
      } catch (err: any) {
        // Remove the optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg._id !== tempId));

        setError(err.response?.data?.message || "Failed to send message");
        console.error("Error sending message:", err);
        return null;
      } finally {
        setSending(false);
      }
    },
    [chatId, currentUser]
  );

  // Initial fetch
  useEffect(() => {
    if (chatId) {
      fetchMessages();

      // Join the chat room when the chat ID changes
      if (isConnected) {
        joinChat(chatId);
      }
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [chatId]);

  // Listen for new messages via Socket.IO
  useEffect(() => {
    if (!socket || !chatId) return;

    // Handler for new messages received via Socket.IO
    const handleNewMessage = (newMessage: Message) => {
      console.log("New message received:", newMessage);

      // Only add the message if it's for the current chat
      if (newMessage.chat === chatId) {
        // Avoid duplicate messages (that we might have sent ourselves)
        setMessages((prevMessages) => {
          // Check if we already have this message (by ID)
          if (prevMessages.some((msg) => msg._id === newMessage._id)) {
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });
      }
    };

    // Subscribe to new messages
    socket.on("new_message", handleNewMessage);

    // Clean up
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, chatId]);

  // Helpers
  const clearError = () => setError(null);

  const setFile = (file: File | null) => setFileAttachment(file);

  return {
    messages,
    loading,
    sending,
    error,
    fileAttachment,
    pagination,
    fetchMessages,
    sendMessage,
    clearError,
    setFile,
  };
}
