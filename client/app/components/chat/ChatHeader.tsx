"use client";

import React, { useState, useEffect } from "react";
import { Chat } from "../../types";
import QRCode from "react-qr-code";

interface ChatHeaderProps {
  chat: Chat | null;
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  if (!chat) return null;
  const [showCopied, setShowCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite?id=${chat._id}`
      : ``;

  useEffect(() => {
    let toastTimeout: NodeJS.Timeout;
    if (showToast) {
      toastTimeout = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }

    return () => {
      if (toastTimeout) clearTimeout(toastTimeout);
    };
  }, [showToast]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setShowCopied(true);
    setShowToast(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleToggleQRCode = () => {
    setShowQRCode(!showQRCode);
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
        <div className="flex space-x-2">
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

          <button
            onClick={handleToggleQRCode}
            className="font-medium text-xs flex items-center bg-green-900 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <rect x="7" y="7" width="3" height="3"></rect>
              <rect x="14" y="7" width="3" height="3"></rect>
              <rect x="7" y="14" width="3" height="3"></rect>
              <rect x="14" y="14" width="3" height="3"></rect>
            </svg>
            QR Code
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center animate-fade-in z-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Link copied to clipboard!
        </div>
      )}

      {/* QR Code Popup */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Share Chat via QR Code</h3>
              <button
                onClick={handleToggleQRCode}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
            <div className="flex flex-col items-center justify-center p-4 bg-white">
              <QRCode value={inviteLink} size={200} level="H" />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                Scan this QR code to join the chat
              </p>
              <button
                onClick={handleCopy}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm"
              >
                Copy Invite Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
