"use client";

import React, { useRef, useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface MessageInputProps {
  onSend: (content: string, file: File | null) => void;
  sending: boolean;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  sending,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [fileAttachment, setFileAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileAttachment(e.target.files[0]);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setFileAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Send message handler
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    if ((!message.trim() && !fileAttachment) || disabled || sending) return;

    onSend(message, fileAttachment);

    // Clear message input right away for better UX
    setMessage("");

    // Only clear file if it was successfully sent (this will be handled in the parent component)
    messageInputRef.current?.focus();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
      {/* File attachment preview */}
      {fileAttachment && (
        <div className="bg-gray-50 dark:bg-gray-900 p-2 px-4 flex items-center mb-2">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded px-3 py-1 mr-2 border border-gray-200 dark:border-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            <span className="ml-2 text-sm truncate max-w-[200px]">
              {fileAttachment.name}
            </span>
          </div>
          <button
            onClick={removeFile}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <Input
            ref={messageInputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 rounded-full"
            disabled={sending || disabled}
          />
          <div className="flex space-x-2">
            {/* File attachment button */}
            <label
              htmlFor="file-upload"
              className={`flex items-center justify-center p-2.5 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer ${
                sending || disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Attach file"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </label>
            <input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={sending || disabled}
            />

            {/* Send button */}
            <Button
              type="submit"
              disabled={
                (!message.trim() && !fileAttachment) || sending || disabled
              }
              variant="primary"
              className="p-2.5 rounded-full"
              isLoading={sending}
              icon={
                !sending && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )
              }
            >
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="text-xs text-gray-500 dark:text-gray-400 ml-auto mt-1">
          Press Ctrl+Enter to send
        </div>
      </form>
    </div>
  );
}
