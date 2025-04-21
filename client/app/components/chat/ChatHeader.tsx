"use client";

import React from "react";
import { Chat } from "../../types";

interface ChatHeaderProps {
  chat: Chat | null;
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  if (!chat) return null;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700">
      <div className="flex justify-between items-center">
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
      </div>
    </div>
  );
}
