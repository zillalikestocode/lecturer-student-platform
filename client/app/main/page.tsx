"use client";

import { useState, useEffect } from "react";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import LoginComponent from "../components/LoginComponent";
import { Chat, User } from "../types";
import { useChats } from "../hooks/useChats";

export default function MainPage() {
  const [user, setUser] = useState<User | null>(null);

  // Use our custom hook for managing chats
  const { chats, currentChat, selectChat } = useChats({
    currentUser: user as User,
  });

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

  // Handle user login
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
  };

  // Handle user logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Handle chat selection
  const handleSelectChat = (chat: Chat) => {
    selectChat(chat);
  };

  // If not logged in, show login form
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoginComponent onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="bg-green-500 h-10 w-10 flex items-center justify-center rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="font-bold text-2xl ml-2 text-gray-900 dark:text-white">
            EduChat
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900 rounded-full w-8 h-8 flex items-center justify-center mr-2">
              <span className="text-green-800 dark:text-green-200 font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-medium mr-3">{user.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1.5 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ChatList
            currentUser={user}
            selectedChat={currentChat}
            onChatSelect={handleSelectChat}
          />
        </div>
        <div className="md:col-span-2">
          <ChatWindow currentChat={currentChat} currentUser={user} />
        </div>
      </div>
    </div>
  );
}
