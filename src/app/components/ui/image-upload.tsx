import React, { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon, Loader2, AlertCircle } from "lucide-react";
import {
  isValidImageUrl,
  isCloudinaryUrl,
  formatFileSize,
} from "../../../lib/image-utils";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  onUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onUpload,
  disabled = false,
  className = "",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUrlMode, setIsUrlMode] = useState(
    !!value && !isCloudinaryUrl(value)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (imageFile) {
        await handleFileUpload(imageFile);
      }
    },
    [disabled]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleFileUpload(file);
      }
    },
    []
  );

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size should be less than 5MB");
      return;
    }

    // If user has a URL image and tries to upload, ask for confirmation
    if (value && !isCloudinaryUrl(value)) {
      if (
        !confirm("Uploading an image will replace the current URL. Continue?")
      ) {
        return;
      }
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Include old image URL for deletion
      if (value && isCloudinaryUrl(value)) {
        formData.append("oldImageUrl", value);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onChange(data.imageUrl);
      setIsUrlMode(false);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;

    // If there's already an uploaded image, ask for confirmation
    if (value && isCloudinaryUrl(value) && url) {
      if (
        !confirm("Entering a URL will replace the uploaded image. Continue?")
      ) {
        return;
      }
      // Delete the uploaded image
      handleRemoveImage();
    }

    onChange(url);

    // Validate URL if it's not empty
    if (url && !isValidImageUrl(url)) {
      setUploadError("Please enter a valid image URL");
    } else {
      setUploadError(null);
    }
  };

  const handleRemoveImage = async () => {
    if (value && isCloudinaryUrl(value)) {
      try {
        await fetch(`/api/upload?imageUrl=${encodeURIComponent(value)}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
    onChange("");
    setIsUrlMode(false);
  };

  const toggleMode = () => {
    if (!isUrlMode && value) {
      // Switching from upload to URL mode - ask for confirmation if there's an uploaded image
      if (isCloudinaryUrl(value)) {
        if (
          confirm(
            "Switching to URL mode will remove the uploaded image. Continue?"
          )
        ) {
          handleRemoveImage();
          setIsUrlMode(true);
        }
      } else {
        setIsUrlMode(true);
      }
    } else {
      setIsUrlMode(!isUrlMode);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Product Image *
        </label>
        <button
          type="button"
          onClick={toggleMode}
          disabled={disabled || isUploading}
          className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          {isUrlMode ? "Switch to Upload" : "Switch to URL"}
        </button>
      </div>

      {isUrlMode ? (
        /* URL Input Mode */
        <div className="space-y-2">
          <input
            type="url"
            value={value}
            onChange={handleUrlChange}
            placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <p className="text-xs text-gray-500">
            Supported formats: JPG, PNG, GIF, WebP. URL must end with file
            extension.
          </p>
        </div>
      ) : (
        /* Upload Mode */
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ${
            isDragging
              ? "border-blue-500 bg-blue-50 scale-105"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() =>
            !disabled && !isUploading && fileInputRef.current?.click()
          }
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div className="text-center">
              <Loader2 className="w-10 h-10 mx-auto text-blue-600 animate-spin mb-3" />
              <p className="text-sm text-gray-600 font-medium">
                Uploading image...
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Please wait while we process your image
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div
                className={`transition-colors duration-200 ${
                  isDragging ? "text-blue-500" : "text-gray-400"
                }`}
              >
                <Upload className="w-10 h-10 mx-auto mb-3" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                {isDragging
                  ? "Drop your image here"
                  : "Drag and drop an image here, or click to select"}
              </p>
              <p className="text-xs text-gray-400">
                PNG, JPG, GIF, WebP up to 5MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* Image Preview */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={disabled || isUploading}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
          {isCloudinaryUrl(value) && (
            <div className="absolute bottom-1 left-1 bg-green-500 bg-opacity-90 text-white text-xs px-2 py-1 rounded">
              Uploaded
            </div>
          )}
        </div>
      )}
    </div>
  );
}
