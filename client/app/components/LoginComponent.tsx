"use client";

import { useState } from "react";
import { User } from "../types";
import { userService } from "../services/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { ErrorMessage } from "./ui/ErrorMessage";

interface LoginComponentProps {
  onLogin: (user: User) => void;
}

export default function LoginComponent({ onLogin }: LoginComponentProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      if (isLogin) {
        // Login
        const data = await userService.login(email, password);
        onLogin(data);
      } else {
        // Register
        const data = await userService.register(name, email, password, role);
        onLogin(data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "An error occurred. Please try again later."
      );
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
            Lecture Student Platform
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isLogin
              ? "Sign in to your account"
              : "Create a new account to get started"}
          </p>
        </div>

        <ErrorMessage error={error} />

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

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
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
    </div>
  );
}
