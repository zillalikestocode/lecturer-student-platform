"use client";

import { useState, useEffect } from "react";
import { Chat, User } from "../types";
import { Button } from "./ui/Button";
import { ErrorMessage } from "./ui/ErrorMessage";
import { ChatListItem } from "./chat/ChatListItem";
import { ChatSearch } from "./chat/ChatSearch";
import { useChats } from "../hooks/useChats";
import { userService } from "../services/api";

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
  const [isSearchingLecturers, setIsSearchingLecturers] = useState(false);
  const [lecturerSearchTerm, setLecturerSearchTerm] = useState("");
  const [lecturerResults, setLecturerResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Use our custom hook for chat operations
  const { chats, loading, error, createChat, createLecturerChat, clearError } =
    useChats({
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

  // Search for lecturers
  const searchLecturers = async (query: string) => {
    if (!query.trim()) {
      setLecturerResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setSearchError(null);

      const userString = localStorage.getItem("user");
      if (!userString) {
        throw new Error("Authentication required");
      }
      const user = JSON.parse(userString);

      const data = await userService.searchLecturers(user.token, query);
      setLecturerResults(data.results);
    } catch (err) {
      console.error("Error searching lecturers:", err);
      setSearchError("Failed to search lecturers");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle lecturer search input change with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSearchingLecturers && lecturerSearchTerm) {
        searchLecturers(lecturerSearchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [lecturerSearchTerm]);

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

  // Toggle lecturer search
  const toggleLecturerSearch = () => {
    setIsSearchingLecturers(!isSearchingLecturers);
    if (!isSearchingLecturers) {
      setLecturerSearchTerm("");
      setLecturerResults([]);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium">Conversations</h2>
        <div className="flex space-x-2">
          <Button
            onClick={toggleLecturerSearch}
            variant={isSearchingLecturers ? "primary" : "secondary"}
            size="sm"
            className="rounded-full flex items-center justify-center"
            aria-label="Search lecturers"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
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
      </div>

      {/* Lecturer search */}
      {isSearchingLecturers && (
        <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="mb-2">
            <h3 className="text-sm font-medium mb-1">Search Lecturers</h3>
            <p className="text-xs text-gray-500">
              Find by name, faculty, or department
            </p>
          </div>
          <input
            type="text"
            value={lecturerSearchTerm}
            onChange={(e) => setLecturerSearchTerm(e.target.value)}
            placeholder="Search lecturers..."
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
          />

          {isLoading && (
            <div className="flex justify-center items-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
            </div>
          )}

          {searchError && (
            <div className="mt-2 text-xs text-red-500">{searchError}</div>
          )}

          {lecturerResults.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
              {lecturerResults.map((lecturer) => (
                <div
                  key={lecturer._id}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 w-8 h-8 rounded-full flex items-center justify-center">
                        <span className="text-sm text-green-800 dark:text-green-200">
                          {lecturer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium">{lecturer.name}</p>
                        <p className="text-xs text-gray-500">
                          {lecturer.faculty ? `${lecturer.faculty}` : ""}
                          {lecturer.department && lecturer.faculty ? " - " : ""}
                          {lecturer.department ? `${lecturer.department}` : ""}
                          {!lecturer.faculty && !lecturer.department
                            ? "Lecturer"
                            : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation(); // Prevent the div's onClick from firing
                        // Create a new chat with this lecturer
                        try {
                          const newChat = await createLecturerChat(
                            lecturer._id
                          );
                          if (newChat) {
                            onChatSelect(newChat);
                            setIsSearchingLecturers(false);
                          }
                        } catch (err) {
                          console.error(
                            "Error creating chat with lecturer:",
                            err
                          );
                          setSearchError("Failed to create chat with lecturer");
                        }
                      }}
                      className="text-xs px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Chat Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
