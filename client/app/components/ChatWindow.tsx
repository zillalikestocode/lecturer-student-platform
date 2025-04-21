"use client";

import { useEffect, useRef } from "react";
import { Chat, User } from "../types";
import { useMessages } from "../hooks/useMessages";
import { ChatHeader } from "./chat/ChatHeader";
import { MessageList } from "./message/MessageList";
import { MessageInput } from "./message/MessageInput";
import { ErrorMessage } from "./ui/ErrorMessage";

interface ChatWindowProps {
  currentChat: Chat | null;
  currentUser: User;
}

export default function ChatWindow({
  currentChat,
  currentUser,
}: ChatWindowProps) {
  const messageInputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    loading,
    sending,
    error,
    fileAttachment,
    sendMessage,
    clearError,
    setFile,
  } = useMessages({
    chatId: currentChat?._id || null,
    currentUser,
  });

  // Focus on input when chat changes
  useEffect(() => {
    messageInputRef.current?.focus();
  }, [currentChat]);

  // Handle sending messages
  const handleSendMessage = async (content: string, file: File | null) => {
    const result = await sendMessage(content, file);
    if (result && file) {
      // Clear file attachment only on successful send
      setFile(null);
    }
  };

  if (!currentChat) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-[calc(100vh-8rem)] flex flex-col justify-center items-center p-8">
        <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-full mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
          No chat selected
        </h3>
        <p className="text-center text-gray-500 max-w-md">
          Select an existing conversation or create a new one to start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-[calc(100vh-8rem)] flex flex-col">
      {/* Chat header */}
      <ChatHeader chat={currentChat} />

      {/* Error display */}
      <ErrorMessage error={error} onDismiss={clearError} />

      {/* Messages - WhatsApp style */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-[#e5ddd5] dark:bg-gray-900 bg-opacity-60 relative">
        <MessageList
          messages={messages}
          currentUser={currentUser}
          loading={loading}
          chatId={currentChat._id}
        />
      </div>

      {/* Send message form */}
      <MessageInput
        onSend={handleSendMessage}
        sending={sending}
        disabled={!currentChat}
      />
    </div>
  );
}
