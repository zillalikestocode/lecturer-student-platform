"use client";

import { useState, useEffect } from "react";
import { User, Message } from "../../types";
import { messageService } from "../../services/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ErrorMessage } from "../ui/ErrorMessage";

interface MessageHistoryProps {
  chatId: string;
  currentUser: User;
  onClose: () => void;
}

interface PaginatedMessages {
  messages: Message[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    hasMore: boolean;
  };
}

export default function MessageHistory({
  chatId,
  currentUser,
  onClose,
}: MessageHistoryProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    hasMore: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Fetch messages with pagination
  const fetchMessages = async (page = 1) => {
    try {
      setLoading(true);

      const data = await messageService.getMessages(
        currentUser?.token!,
        chatId,
        page,
        20
      );

      setMessages(data.messages);
      setPagination(data.pagination);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load messages");
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search messages
  const searchMessages = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setLoading(true);

      const results = await messageService.searchMessages(
        currentUser?.token!,
        chatId,
        searchQuery
      );

      setMessages(results.results);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to search messages");
      console.error("Error searching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // Export chat history
  const exportChatHistory = async () => {
    try {
      setExporting(true);

      const exportData = await messageService.exportChatHistory(
        currentUser?.token!,
        chatId
      );

      // Create a JSON blob and trigger download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-history-${chatId}-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to export chat history");
      console.error("Error exporting chat history:", err);
    } finally {
      setExporting(false);
    }
  };

  // Clear search and reset to paginated view
  const clearSearch = () => {
    setIsSearching(false);
    setSearchQuery("");
    fetchMessages(1);
  };

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get sender name
  const getSenderName = (sender: any): string => {
    if (typeof sender === "string") return "Unknown User";
    return sender.name || "Unknown User";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-primary/10 p-1.5 rounded-full mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-lg font-medium">Message History</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="p-1.5"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>

        {/* Display error if any */}
        <ErrorMessage error={error} onDismiss={() => setError(null)} />

        {/* Search and Export Controls */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <Input
                type="text"
                placeholder="Search messages..."
                className="py-2 text-sm flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && searchQuery.trim() && searchMessages()
                }
              />
              <Button
                variant="primary"
                size="sm"
                onClick={searchMessages}
                disabled={loading || !searchQuery.trim()}
                isLoading={loading && isSearching}
              >
                Search
              </Button>
              {isSearching && (
                <Button variant="secondary" size="sm" onClick={clearSearch}>
                  Clear
                </Button>
              )}
            </div>
            <Button
              variant="success"
              size="sm"
              onClick={exportChatHistory}
              disabled={exporting}
              isLoading={exporting}
              icon={
                !exporting && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )
              }
            >
              Export
            </Button>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {loading && !isSearching ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-gray-500 mt-2 text-sm">
                  Loading messages...
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full inline-block mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="font-medium mb-1">No Messages Found</h3>
              <p className="text-gray-500 text-sm">
                {isSearching
                  ? "No messages match your search query."
                  : "No messages in this chat yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const isCurrentUser =
                  typeof message.sender === "string"
                    ? message.sender === currentUser._id
                    : message.sender._id === currentUser._id;

                return (
                  <div
                    key={message._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            isCurrentUser
                              ? "bg-primary/10 text-primary"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {getSenderName(message.sender)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span className="font-medium text-sm ml-2">
                          {getSenderName(message.sender)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                    <div className="mt-2 pl-10">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {!isSearching && !loading && messages.length > 0 && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-800 gap-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Showing {messages.length} of {pagination.total} messages
            </div>
            <div className="flex items-center">
              <Button
                variant={pagination.page === 1 ? "ghost" : "secondary"}
                size="sm"
                className="px-3 py-1"
                onClick={() =>
                  pagination.page > 1 && fetchMessages(pagination.page - 1)
                }
                disabled={pagination.page === 1}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                <span className="sr-only">Previous</span>
              </Button>
              <span className="px-4 text-sm">
                Page {pagination.page} of {pagination.pages || 1}
              </span>
              <Button
                variant={!pagination.hasMore ? "ghost" : "secondary"}
                size="sm"
                className="px-3 py-1"
                onClick={() =>
                  pagination.hasMore && fetchMessages(pagination.page + 1)
                }
                disabled={!pagination.hasMore}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
