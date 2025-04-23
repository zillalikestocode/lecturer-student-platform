import axios from "axios";

// Base API URL
const API_BASE_URL = "https://lecturer-api.emmanuelngoka.work/api";

export const api = {
  // Method to create axios instance with auth token
  createAxiosInstance(token: string) {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },
};

// Chat API service
export const chatService = {
  // Get all chats for the current user
  async getChats(token: string) {
    const instance = api.createAxiosInstance(token);
    const response = await instance.get("/chats");
    return response.data;
  },

  // Get a specific chat by ID
  async getChat(token: string, chatId: string) {
    const instance = api.createAxiosInstance(token);
    const response = await instance.get(`/chats/${chatId}`);
    return response.data;
  },

  // Create a chat with a lecturer
  async createLecturerChat(token: string, lecturerId: string) {
    const instance = api.createAxiosInstance(token);
    const response = await instance.post("/chats/lecturer", { lecturerId });
    return response.data;
  },

  // Create a new chat
  async createChat(
    token: string,
    data: { name: string; participants: string[] }
  ) {
    const instance = api.createAxiosInstance(token);
    const response = await instance.post("/chats", data);
    return response.data;
  },

  // Delete a chat
  async deleteChat(token: string, chatId: string) {
    const instance = api.createAxiosInstance(token);
    const response = await instance.delete(`/chats/${chatId}`);
    return response.data;
  },

  // Accept invite
  async acceptInvite(token: string, chatId: string) {
    const instance = api.createAxiosInstance(token);
    const response = await instance.get(`/chats/accept/${chatId}`);
    console.log(response.data);
    return response.data;
  },
};

// Message API service
export const messageService = {
  // Get messages for a chat
  async getMessages(token: string, chatId: string, page = 1, limit = 20) {
    const instance = api.createAxiosInstance(token);
    const response = await instance.get(
      `/chats/${chatId}/messages?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Send a message to a chat
  async sendMessage(
    token: string,
    chatId: string,
    content: string,
    file?: File
  ) {
    const instance = api.createAxiosInstance(token);

    if (file) {
      // Create form data for file uploads
      const formData = new FormData();
      formData.append("chatId", chatId);

      if (content.trim()) {
        formData.append("content", content);
      }

      formData.append("file", file);

      // Override the content-type header for multipart form data
      const response = await axios.post(
        `${API_BASE_URL}/chats/${chatId}/messages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } else {
      const response = await instance.post(`/chats/${chatId}/messages`, {
        chatId,
        content,
      });
      return response.data;
    }
  },

  // Search through chat messages
  async searchMessages(token: string, chatId: string, query: string) {
    const instance = api.createAxiosInstance(token);
    const response = await instance.get(
      `/chats/${chatId}/messages/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  },

  // Export chat history
  async exportChatHistory(token: string, chatId: string) {
    const instance = api.createAxiosInstance(token);
    const response = await instance.get(`/chats/${chatId}/export`);
    return response.data;
  },
};

// User API service
export const userService = {
  // Login user
  async login(email: string, password: string) {
    const response = await axios.post(`${API_BASE_URL}/users/login`, {
      email,
      password,
    });
    return response.data;
  },

  // Search for lecturers by name, faculty or department
  async searchLecturers(token: string, query: string) {
    const instance = api.createAxiosInstance(token);
    const response = await instance.get(
      `/users/search/lecturers?query=${encodeURIComponent(query)}`
    );
    return response.data;
  },

  // Register user
  async register(
    name: string,
    email: string,
    password: string,
    role: string,
    department?: string,
    faculty?: string,
    matriculationNumber?: string
  ) {
    const response = await axios.post(`${API_BASE_URL}/users/register`, {
      name,
      email,
      password,
      role,
      department,
      faculty,
      matriculationNumber,
    });
    return response.data;
  },

  // Get current user profile
  async getProfile(token: string) {
    const instance = api.createAxiosInstance(token);
    const response = await instance.get("/users/profile");
    return response.data;
  },
};
