"use client";

import React from "react";
import { Chat, User } from "../../types";

interface ChatListItemProps {
  chat: Chat;
  currentUser: User;
  isActive: boolean;
  onClick: () => void;
}

export function ChatListItem({
  chat,
  currentUser,
  isActive,
  onClick,
}: ChatListItemProps) {
  // Format the last activity time
  const formatLastActivity = (timestamp: string | undefined) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Get last message summary
  const getLastMessagePreview = () => {
    if (!chat.latestMessage) return "No messages yet";

    const isCurrentUserLastSender =
      typeof chat.latestMessage.sender === "string"
        ? chat.latestMessage.sender === currentUser._id
        : chat.latestMessage.sender._id === currentUser._id;

    const prefix = isCurrentUserLastSender ? "You: " : "";

    return `${prefix}${chat.latestMessage.content}`;
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? "bg-green-50 dark:bg-green-900/20"
          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
      }`}
    >
      {/* Chat icon/avatar */}
      <div className="relative">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-600 dark:text-green-400"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          >
            <path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            <path d="M8 12h.01" />
            <path d="M12 12h.01" />
            <path d="M16 12h.01" />
          </svg>
        </div>

        {/* Unread indicator */}
        {/* {chat.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
          </div>
        )} */}
      </div>

      {/* Chat details */}
      <div className="ml-3 flex-1 overflow-hidden">
        <div className="flex justify-between items-baseline">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {chat.name}
          </h3>
          {chat.latestMessage && (
            <span className="text-xs text-gray-500">
              {formatLastActivity(chat.latestMessage.createdAt)}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {getLastMessagePreview()}
        </p>
      </div>
    </div>
  );
}
