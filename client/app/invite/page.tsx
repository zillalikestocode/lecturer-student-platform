"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import axios from "axios";
import { useChats } from "../hooks/useChats";
import { Chat, User } from "../types";
import LoginComponent from "../components/LoginComponent";
import { notFound, useSearchParams } from "next/navigation";

export default function InvitePage() {
  const [user, setUser] = useState<User | null>(null);
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id") as string;
  const [chat, setChat] = useState<Chat | null>();
  const [loading, setLoading] = useState(true);
  const { acceptInvite, getChat } = useChats({ currentUser: user as User });

  // Check for saved user session on load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Failed to parse saved user:", err);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
  };

  const acceptFunc = async () => {
    if (!chatId) return false;
    const success = await acceptInvite(chatId);
    if (success) {
      window.location.href = "/";
    }
  };

  const fetchChat = async () => {
    if (!chatId) return;
    const chatData = await getChat(chatId);
    setChat(chatData);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchChat();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg
          className="animate-spin h-12 w-12 text-green-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoginComponent onLogin={handleLogin} />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="card-container p-8 max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600 dark:text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.352-.035-.696-.1-1.029a5 5 0 00-4.9-2.971z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Chat Invitation
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-center mb-8">
            <span className="font-medium">{chat?.name}</span> invited you to
            join their chat.
          </p>
          <Button
            onClick={acceptFunc}
            type="button"
            variant="primary"
            size="lg"
            className="w-full"
          >
            Accept Invite
          </Button>
          <button className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium">
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
