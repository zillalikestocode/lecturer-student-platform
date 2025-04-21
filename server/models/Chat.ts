import mongoose from "mongoose";

// Chat interface
export interface IChat extends mongoose.Document {
  name: string;
  participants: mongoose.Schema.Types.ObjectId[];
  isGroupChat: boolean;
  latestMessage: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Chat schema
const chatSchema = new mongoose.Schema<IChat>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

// Create and export Chat model
const Chat = mongoose.model<IChat>("Chat", chatSchema);
export default Chat;
