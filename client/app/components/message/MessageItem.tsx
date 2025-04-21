"use client";

import React from "react";
import { Message, User } from "../../types";

interface MessageItemProps {
  message: Message;
  currentUser: User;
  getSenderName: (senderId: string) => string;
}

export function MessageItem({
  message,
  currentUser,
  getSenderName,
}: MessageItemProps) {
  const isCurrentUser = (message.sender as User)._id === currentUser._id;

  // Format timestamp
  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`rounded-lg py-2 px-4 max-w-[70%] shadow-sm ${
          isCurrentUser
            ? "bg-[#dcf8c6] dark:bg-green-800"
            : "bg-white dark:bg-gray-700"
        }`}
      >
        {!isCurrentUser && (
          <div className="font-medium text-xs text-blue-600 dark:text-blue-400 mb-1">
            {getSenderName(
              (message.sender as User)._id || (message.sender as string)
            )}
          </div>
        )}
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
          {message.content}
        </p>
        {/* If message has attachments, we would display them here */}

        <div className="flex justify-end mt-1">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            {formatTime(message.createdAt)}
            {isCurrentUser && (
              <span className="ml-1">
                {message.pending ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 inline"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 inline text-blue-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}{" "}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
