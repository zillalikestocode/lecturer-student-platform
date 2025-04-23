import express from "express";
import {
  getUserChats,
  getChatById,
  createChat,
  deleteChat,
  exportChatHistory,
  acceptParticipant,
  createLecturerChat,
} from "../controllers/chatController";
import { protect } from "../middleware/auth";

const router = express.Router();

// All chat routes are protected
router.use(protect);

// Chat routes
router.route("/").get(getUserChats).post(createChat);

// Lecturer direct chat route
router.post("/lecturer", createLecturerChat);

router.route("/:id").get(getChatById).delete(deleteChat);

router.get("/:id/export", exportChatHistory);
router.get("/accept/:chatId", acceptParticipant);

export default router;
