"use client";

import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  onIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, onIconClick, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50 ${
              icon ? "pr-10" : ""
            } ${error ? "border-red-500" : ""} ${className}`}
            {...props}
          />
          {icon && (
            <div
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 ${
                onIconClick
                  ? "cursor-pointer hover:text-gray-600 dark:hover:text-gray-400"
                  : ""
              }`}
              onClick={onIconClick}
            >
              {icon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
