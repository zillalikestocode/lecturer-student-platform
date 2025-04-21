"use client";

import React from "react";
import { Chat } from "../../types";

interface ChatHeaderProps {
  chat: Chat | null;
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  if (!chat) return null;
  const [showCopied, setShowCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      window.location.href + `invite?id=${chat._id}`
    );
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className="border-b w-full border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700">
      <div className="flex w-full justify-between items-center">
        <div className="flex items-center">
          <div className="bg-green-100 dark:bg-green-900 w-10 h-10 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-medium">{chat.name}</h2>
            <p className="text-xs text-gray-500">
              {Array.isArray(chat.participants) && chat.participants.length}{" "}
              participants
            </p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="font-medium text-xs flex items-center bg-green-900 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          Copy Link
          {showCopied && (
            <span className="absolute -top-8 left-0 bg-gray-900 text-white px-2 py-1 rounded text-xs">
              Link copied!
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
