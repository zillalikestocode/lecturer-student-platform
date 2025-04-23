import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUsers,
  getUserById,
  getUserProfile,
  searchLecturers,
  sendCode,
} from "../controllers/userController";
import { protect } from "../middleware/auth";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/send-code", sendCode);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.get("/search/lecturers", protect, searchLecturers);
router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);

export default router;
