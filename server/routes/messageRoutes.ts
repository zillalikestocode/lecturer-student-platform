import express from "express";
import {
  sendMessage,
  getMessages,
  searchMessages,
} from "../controllers/messageController";
import { protect } from "../middleware/auth";

const router = express.Router({ mergeParams: true });

// All message routes are protected
router.use(protect);

// Message routes
router.route("/").get(getMessages).post(sendMessage);

router.get("/search", searchMessages);

export default router;
