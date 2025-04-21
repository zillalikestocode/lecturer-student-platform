"use client";

import { useState } from "react";
import { Chat, User } from "../types";
import { Button } from "./ui/Button";
import { ErrorMessage } from "./ui/ErrorMessage";
import { ChatListItem } from "./chat/ChatListItem";
import { ChatSearch } from "./chat/ChatSearch";
import { useChats } from "../hooks/useChats";

interface ChatListProps {
  currentUser: User;
  onChatSelect: (chat: Chat) => void;
  selectedChat: Chat | null;
}

export default function ChatList({
  currentUser,
  onChatSelect,
  selectedChat,
}: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [newChatName, setNewChatName] = useState("");

  // Use our custom hook for chat operations
  const { chats, loading, error, createChat, clearError } = useChats({
    currentUser,
  });

  // Filter chats based on search term
  const filteredChats = searchTerm
    ? chats.filter(
        (chat) =>
          chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (chat.latestMessage &&
            chat.latestMessage.content
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      )
    : chats;

  // Handle new chat creation
  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newChatName.trim()) return;

    const newChat = await createChat(newChatName, [currentUser._id]);

    if (newChat) {
      setShowNewChatForm(false);
      setNewChatName("");
      onChatSelect(newChat);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium">Conversations</h2>
        <Button
          onClick={() => setShowNewChatForm(!showNewChatForm)}
          variant="primary"
          size="sm"
          className="rounded-full w-8 h-8 p-0 flex items-center justify-center"
          aria-label="New chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>

      {/* New chat form */}
      {showNewChatForm && (
        <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleCreateChat} className="flex items-center gap-2">
            <input
              type="text"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="Chat name..."
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!newChatName.trim()}
            >
              Create
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowNewChatForm(false)}
            >
              Cancel
            </Button>
          </form>
        </div>
      )}

      {/* Error message */}
      <ErrorMessage error={error} onDismiss={clearError} />

      {/* Search */}
      <ChatSearch onSearch={handleSearch} />

      {/* Chats list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            {searchTerm
              ? "No conversations match your search"
              : "No conversations yet. Create your first one!"}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                currentUser={currentUser}
                isActive={selectedChat?._id === chat._id}
                onClick={() => onChatSelect(chat)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
