export interface User {
  _id: string;
  name: string;
  email: string;
  role: "lecturer" | "student";
  token?: string;
}

export interface Message {
  _id: string;
  sender: string | User;
  content: string;
  chat: string;
  createdAt: string;
  updatedAt: string;
  pending: boolean;
}

export interface Chat {
  _id: string;
  name: string;
  participants: string[] | User[];
  isGroupChat: boolean;
  latestMessage?: Message;
  messages?: Message[];
  createdAt?: string;
  updatedAt?: string;
}
