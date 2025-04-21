"use client";

import React, { useRef, useEffect } from "react";
import { Message, User, Chat } from "../../types";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  loading: boolean;
  chatId: string | null;
}

export function MessageList({
  messages,
  currentUser,
  loading,
  chatId,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get sender name
  const getSenderName = (senderId: string): string => {
    if (senderId === currentUser._id) return "You";

    // Find sender in message.senderInfo if available
    const message = messages.find(
      (m) =>
        (typeof m.sender === "string"
          ? m.sender === senderId
          : m.sender._id === senderId) && m.sender
    );

    if (message && message.sender) {
      return (message.sender as User).name || "Unknown User";
    }

    return "Unknown User";
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = [];

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toDateString();

      const existingGroup = groups.find((group) => group.date === messageDate);

      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          messages: [message],
        });
      }
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!chatId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          No chat selected
        </h3>
        <p className="text-gray-500 max-w-sm">
          Select a chat from the list to start messaging
        </p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          No messages yet
        </h3>
        <p className="text-gray-500 max-w-sm">
          Be the first to send a message in this conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messageGroups.map((group, groupIndex) => (
        <div key={group.date}>
          {/* Date divider */}
          <div className="flex justify-center my-4">
            <div className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs px-3 py-1 rounded-full shadow-sm">
              {new Date(group.date).toLocaleDateString()}
            </div>
          </div>

          {/* Messages for this date */}
          {group.messages.map((message) => (
            <MessageItem
              key={message._id}
              message={message}
              currentUser={currentUser}
              getSenderName={getSenderName}
            />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
