import React from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface Option {
  value: string;
  label: string;
  _id?: string;
}

interface FormSelectProps {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  error?: string;
  emptyMessage?: string;
  linkText?: string;
  linkHref?: string;
  linkTarget?: "_blank" | "_self";
  showRefresh?: boolean;
  onRefresh?: () => void;
  refreshText?: string;
}

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  className = "",
  helperText,
  error,
  emptyMessage,
  linkText,
  linkHref,
  linkTarget = "_self",
  showRefresh = false,
  onRefresh,
  refreshText = "↻ Refresh",
}: FormSelectProps) {
  return (
    <div className={className}>
      {/* Label with optional link and refresh */}
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {(linkText || showRefresh) && (
            <div className="flex items-center gap-2">
              {showRefresh && onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="text-xs text-gray-600 hover:text-gray-700 px-2 py-1 border border-gray-300 rounded transition-colors"
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

      {/* Select field using Radix UI */}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : ""
          }
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option._id || option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Empty state message */}
      {options.length === 0 && (emptyMessage || (linkText && linkHref)) && (
        <p className="text-xs text-gray-500 mt-1">
          {emptyMessage || "No options available."}{" "}
          {linkText && linkHref && (
            <Link href={linkHref} className="text-blue-600 hover:underline">
              {linkText}
            </Link>
          )}
        </p>
      )}

      {/* Error message */}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}

      {/* Helper text */}
      {helperText && !error && options.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}
