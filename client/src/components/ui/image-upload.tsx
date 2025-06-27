import React, { useRef, useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Progress } from './progress';
import { useCloudinaryUpload } from '../../hooks/use-cloudinary';
import { Upload, X, Image } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onUploadStateChange?: (isUploading: boolean) => void; // New prop to notify parent of upload state
  label?: string;
  required?: boolean;
  accept?: string;
  maxSizeInMB?: number;
  urlOnly?: boolean; // New prop to disable file upload entirely
}

export function ImageUpload({
  value,
  onChange,
  onUploadStateChange,
  label = "Image",
  required = false,
  accept = "image/*",
  maxSizeInMB = 5,
  urlOnly = false
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(value || "");
  const [isUploadedFile, setIsUploadedFile] = useState(false); // Track if current image is from file upload
  const [previousImageUrl, setPreviousImageUrl] = useState<string>(value || ""); // Track previous image for deletion
  const { upload, deleteImage, isUploading, progress } = useCloudinaryUpload();
  const { toast } = useToast();

  // Check if Cloudinary is configured (only cloud name needed for signed uploads)
  const isCloudinaryConfigured = !!(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

  // Notify parent component when upload state changes
  useEffect(() => {
    if (onUploadStateChange) {
      onUploadStateChange(isUploading);
    }
  }, [isUploading, onUploadStateChange]);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return false;
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast({
        title: "File Too Large",
        description: `Please select an image smaller than ${maxSizeInMB}MB`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) return;

    // Store current image URL for potential deletion
    const currentImageUrl = previewUrl;

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    try {
      const uploadedUrl = await upload(file);
      if (uploadedUrl) {
        // Delete previous image if it exists and is from Cloudinary
        if (currentImageUrl && currentImageUrl !== uploadedUrl && isUploadedFile) {
          await deleteImage(currentImageUrl);
        }
        
        onChange(uploadedUrl);
        setPreviewUrl(uploadedUrl);
        setPreviousImageUrl(uploadedUrl);
        setIsUploadedFile(true); // Mark as uploaded file
        // Clean up preview URL since we have the real URL
        URL.revokeObjectURL(preview);
      } else {
        // If upload fails but we want to keep the preview for demo purposes
        // You can comment out the next two lines to keep the local preview
        setPreviewUrl(currentImageUrl || "");
        setIsUploadedFile(false);
        URL.revokeObjectURL(preview);
      }
    } catch (error) {
      // Reset preview on error
      setPreviewUrl(currentImageUrl || "");
      setIsUploadedFile(false);
      URL.revokeObjectURL(preview);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url);
    setPreviousImageUrl(url);
    setIsUploadedFile(false); // Mark as manually entered URL
    onChange(url);
  };

  const clearImage = async () => {
    // Delete from Cloudinary if it's an uploaded file
    if (previewUrl && isUploadedFile) {
      await deleteImage(previewUrl);
    }
    
    setPreviewUrl("");
    setPreviousImageUrl("");
    setIsUploadedFile(false);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="image-upload">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      {/* Configuration Notice */}
      {!isCloudinaryConfigured && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Cloudinary is not configured. File uploads will not work. 
            You can still enter image URLs manually below. See IMAGE_UPLOAD_SETUP.md for setup instructions.
          </p>
        </div>
      )}
      
      {/* Preview */}
      {previewUrl && (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={clearImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${isUploading ? 'opacity-50 pointer-events-none' : isCloudinaryConfigured ? 'hover:border-primary' : 'opacity-50'}
        `}
        onDrop={isCloudinaryConfigured ? handleDrop : undefined}
        onDragOver={isCloudinaryConfigured ? handleDragOver : undefined}
        onDragLeave={isCloudinaryConfigured ? handleDragLeave : undefined}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            {isCloudinaryConfigured ? (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-medium text-primary hover:text-primary/80 underline"
                  disabled={isUploading}
                >
                  Click to upload
                </button>
                <span> or drag and drop</span>
              </>
            ) : (
              <span className="text-gray-400">Upload disabled - Cloudinary not configured</span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            PNG, JPG, GIF up to {maxSizeInMB}MB
          </div>
        </div>
        
        {/* Hidden file input - no longer covering the entire zone */}
        {isCloudinaryConfigured && (
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        )}
      </div>

      {/* URL Input Alternative */}
      <div className="space-y-2">
        <Label htmlFor="image-url" className="text-sm text-gray-600">
          {isUploadedFile ? "Uploaded image URL (read-only):" : "Or enter image URL directly:"}
        </Label>
        <div className="flex space-x-2">
          <Input
            id="image-url"
            type="url"
            placeholder={isUploadedFile ? "Image uploaded via file upload" : "https://example.com/image.jpg"}
            value={previewUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={isUploading || isUploadedFile}
            className={isUploadedFile ? "bg-gray-50 text-gray-500" : ""}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !isCloudinaryConfigured}
            title="Upload new image file"
          >
            <Image className="h-4 w-4" />
          </Button>
        </div>
        {isUploadedFile && (
          <p className="text-xs text-gray-500">
            This image was uploaded via file upload. To use a different URL, clear the image first or upload a new file.
          </p>
        )}
      </div>
    </div>
  );
}
