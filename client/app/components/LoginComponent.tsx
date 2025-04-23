"use client";

import { useState } from "react";
import { User } from "../types";
import { userService } from "../services/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useToast } from "../context/ToastContext";

interface LoginComponentProps {
  onLogin: (user: User) => void;
}

export default function LoginComponent({ onLogin }: LoginComponentProps) {
  const { showToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [faculty, setFaculty] = useState("");
  const [matriculationNumber, setMatriculationNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      showToast("Please enter an email address first", "error");
      return;
    }

    try {
      setLoading(true);
      await userService.sendCode(email);
      setIsCodeSent(true);
      showToast("Verification code sent to your email", "success");
    } catch (err: any) {
      showToast(
        err.response?.data?.message ||
          "Failed to send verification code. Please try again.",
        "error"
      );
      console.error("Send code error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isLogin) {
        // Login
        const data = await userService.login(email, password);
        onLogin(data);
        showToast("Login successful", "success");
      } else {
        // For registration, first check if verification code is provided
        if (!verificationCode) {
          showToast(
            "Please enter the verification code sent to your email",
            "error"
          );
          setLoading(false);
          return;
        }

        // Register with OTP
        const data = await userService.register(
          name,
          email,
          password,
          role,
          verificationCode, // Pass OTP as the 5th parameter
          department,
          faculty,
          role === "student" ? matriculationNumber : undefined
        );
        onLogin(data);
        showToast("Account created successfully", "success");
      }
    } catch (err: any) {
      showToast(
        err.response?.data?.message ||
          "An error occurred. Please try again later.",
        "error"
      );
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setVerificationCode("");
    setIsCodeSent(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md">
        {/* EduChat Logo and Branding */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <div className="bg-green-500 h-10 w-10 flex items-center justify-center rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-bold text-2xl ml-2 text-gray-900 dark:text-white">
              EduChat
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
              {isLogin ? "Welcome Back!" : "Join EduChat Today"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-3">
              {isLogin
                ? "Sign in to connect with your academic community"
                : "Create an account to enhance your academic experience"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  label="Full Name"
                  required
                />
              </div>
            )}

            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                label="Email Address"
                required
              />
            </div>

            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                label="Password"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                </select>
              </div>
            )}

            {!isLogin && (
              <div>
                <Input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Enter your department"
                  label="Department"
                />
              </div>
            )}

            {!isLogin && (
              <div>
                <Input
                  type="text"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  placeholder="Enter your faculty"
                  label="Faculty"
                />
              </div>
            )}

            {!isLogin && role === "student" && (
              <div>
                <Input
                  type="text"
                  value={matriculationNumber}
                  onChange={(e) => setMatriculationNumber(e.target.value)}
                  placeholder="Enter your matriculation number"
                  label="Matriculation Number"
                />
              </div>
            )}

            {!isLogin && (
              <div className="flex items-center space-x-2">
                <div className="flex-grow">
                  <Input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter verification code"
                    label="Verification Code"
                  />
                </div>
                <div className="mt-5">
                  <Button
                    type="button"
                    onClick={handleSendCode}
                    disabled={loading || isCodeSent}
                    className="whitespace-nowrap"
                  >
                    {isCodeSent ? "Code Sent" : "Get Code"}
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5"
                isLoading={loading}
                disabled={loading}
              >
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-green-600 dark:text-green-400 hover:underline text-sm font-medium"
            >
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* Additional information */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            {isLogin
              ? "Access your courses, messages, and academic resources in one place."
              : "Join thousands of students and educators already using EduChat."}
          </p>
        </div>
      </div>
    </div>
  );
}
