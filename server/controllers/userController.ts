import type { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../middleware/auth";
import nodemailer from "nodemailer";
import Otp from "../models/Otp";
import dotenv from "dotenv";

dotenv.config();

// Generate a random verification code
const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Send verification code to email
const sendVerificationEmail = async (email: string, code: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your EduChat Verification Code",
    text: `Your verification code is: ${code} From: EduChat Team (${process.env.EMAIL_USER})`,
    html: `
      <h1>EduChat Verification</h1>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>From: EduChat Team (${process.env.EMAIL_USER})</p>
    `,
  });
};

export const sendCode = async (req: Request, res: Response) => {
  const email = req.query.email as string;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const verificationCode = generateVerificationCode();

    // Store the OTP in the database
    await Otp.findOneAndUpdate(
      { email },
      { email, code: verificationCode },
      { upsert: true, new: true }
    );

    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({ message: "Verification code sent successfully" });
  } catch (err) {
    console.error("Send code error:", err);
    res.status(500).json({ message: "An error occurred" });
  }
};

// Register a new user with email verification
export const registerUser = async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    role,
    department,
    faculty,
    matriculationNumber,
    otp: submittedOtp,
  } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      res.status(400).json({ message: "OTP expired" });
      return;
    }
    if (otpRecord.code !== submittedOtp) {
      res.status(400).json({ message: "Incorrect OTP" });
      return;
    }

    // Temporarily store the user data and verification code in the database
    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      faculty,
      matriculationNumber: role === "student" ? matriculationNumber : undefined,
    });

    // Delete the OTP record after successful verification
    await Otp.deleteOne({ email });

    // Generate JWT token
    const token = generateToken((user._id as any).toString());

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === "production", // Use secure in production
      sameSite: "strict",
    });

    // Send response
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      faculty: user.faculty,
      matriculationNumber: user.matriculationNumber,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Authenticate user & get token
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      // Generate JWT token
      const token = generateToken((user._id as any).toString());

      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: process.env.NODE_ENV === "production", // Use secure in production
        sameSite: "strict",
      });

      // Send response
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        faculty: user.faculty,
        matriculationNumber: user.matriculationNumber,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Log user out
export const logoutUser = (_req: Request, res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// Search lecturers by name, faculty or department
export const searchLecturers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    // Search for lecturers by name, faculty, or department using regex for partial matches
    const lecturers = await User.find({
      role: "lecturer",
      $or: [
        { name: { $regex: query, $options: "i" } },
        { faculty: { $regex: query, $options: "i" } },
        { department: { $regex: query, $options: "i" } },
      ],
    }).select("name email faculty department");

    res.json({
      results: lecturers,
      count: lecturers.length,
    });
  } catch (error) {
    console.error("Error searching lecturers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user profile (for currently authenticated user)
export const getUserProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
