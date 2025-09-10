import React from "react";
import Link from "next/link";
import { Input } from "./input";

interface FormInputProps {
  label?: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "url" | "tel";
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  error?: string;
  linkText?: string;
  linkHref?: string;
  linkTarget?: "_blank" | "_self";
  onRefresh?: () => void;
  refreshText?: string;
  min?: number;
  max?: number;
  step?: number;
}

export default function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  helperText,
  error,
  linkText,
  linkHref,
  linkTarget = "_self",
  onRefresh,
  refreshText = "↻ Refresh",
  min,
  max,
  step,
}: FormInputProps) {
  return (
    <div className={className}>
      {/* Label with optional link and refresh */}
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {(linkText || onRefresh) && (
            <div className="flex items-center gap-2">
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="text-xs text-gray-600 hover:text-gray-700 px-2 py-1 border border-gray-300 rounded"
                >
                  {refreshText}
                </button>
              )}
              {linkText && linkHref && (
                <Link
                  href={linkHref}
                  className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  target={linkTarget}
                >
                  {linkText}
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Input field */}
      <Input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
        }
      />

      {/* Error message */}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}

      {/* Helper text */}
      {helperText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}
