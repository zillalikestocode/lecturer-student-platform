import mongoose from "mongoose";

// Message interface
export interface IMessage extends mongoose.Document {
  sender: mongoose.Types.ObjectId;
  content: string;
  chat: mongoose.Types.ObjectId;
  createdAt: Date;
}

// Message schema
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  { timestamps: true }
);

// Create and export Message model
const Message = mongoose.model<IMessage>("Message", messageSchema);
export default Message;
