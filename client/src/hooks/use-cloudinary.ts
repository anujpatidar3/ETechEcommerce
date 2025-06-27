import { useState } from 'react';
import { useToast } from './use-toast';

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  // Add other properties as needed
}

interface UseCloudinaryUpload {
  upload: (file: File) => Promise<string | null>;
  deleteImage: (imageUrl: string) => Promise<boolean>;
  isUploading: boolean;
  progress: number;
}

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export function useCloudinaryUpload(): UseCloudinaryUpload {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const getSignature = async (): Promise<CloudinarySignature | null> => {
    try {
      const response = await fetch('/api/cloudinary/signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ folder: 'etech-products' }),
      });

      if (!response.ok) {
        throw new Error('Failed to get signature');
      }

      return await response.json();
    } catch (error) {
      toast({
        title: "Signature Error",
        description: "Failed to get upload signature. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const upload = async (file: File): Promise<string | null> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      toast({
        title: "Configuration Error",
        description: "Cloudinary cloud name is not configured. Please check your .env file.",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // Get signature from server
      const signatureData = await getSignature();
      if (!signatureData) {
        setIsUploading(false);
        return null;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signatureData.signature);
      formData.append('timestamp', signatureData.timestamp.toString());
      formData.append('api_key', signatureData.apiKey);
      formData.append('folder', signatureData.folder);

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener('load', () => {
          setIsUploading(false);
          if (xhr.status === 200) {
            try {
              const response: CloudinaryResponse = JSON.parse(xhr.responseText);
              toast({
                title: "Upload Successful",
                description: "Image has been uploaded successfully",
              });
              resolve(response.secure_url);
            } catch (error) {
              toast({
                title: "Upload Error",
                description: "Failed to parse upload response",
                variant: "destructive",
              });
              reject(error);
            }
          } else {
            toast({
              title: "Upload Failed",
              description: "Failed to upload image to Cloudinary",
              variant: "destructive",
            });
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          setIsUploading(false);
          toast({
            title: "Upload Error",
            description: "Network error occurred during upload",
            variant: "destructive",
          });
          reject(new Error('Network error'));
        });

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
        xhr.send(formData);
      });
    } catch (error) {
      setIsUploading(false);
      setProgress(0);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      // Not a Cloudinary URL, no need to delete
      return true;
    }

    try {
      // Extract public_id from Cloudinary URL
      const publicId = extractPublicIdFromUrl(imageUrl);
      if (!publicId) {
        console.warn('Could not extract public_id from URL:', imageUrl);
        return false;
      }

      const response = await fetch('/api/cloudinary/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ publicId }),
      });

      if (response.ok) {
        toast({
          title: "Image Deleted",
          description: "Image has been removed from Cloudinary",
        });
        return true;
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Delete Warning",
        description: "Image may not have been removed from Cloudinary",
        variant: "destructive",
      });
      return false;
    }
  };

  // Helper function to extract public_id from Cloudinary URL
  const extractPublicIdFromUrl = (url: string): string | null => {
    try {
      // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) return null;

      // Get everything after 'upload/' and before the file extension
      const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
      
      // Remove transformations if any (starts with v1234567890 or other transformation parameters)
      let publicIdWithFormat = pathAfterUpload;
      
      // If it starts with version number, remove transformations
      const versionMatch = pathAfterUpload.match(/^v\d+\//);
      if (versionMatch) {
        publicIdWithFormat = pathAfterUpload.substring(versionMatch[0].length);
      } else {
        // Remove any transformation parameters (they contain underscores, commas, etc.)
        const transformationMatch = pathAfterUpload.match(/^[^\/]*[_,][^\/]*\//);
        if (transformationMatch) {
          publicIdWithFormat = pathAfterUpload.substring(transformationMatch[0].length);
        }
      }

      // Remove file extension
      const publicId = publicIdWithFormat.replace(/\.[^.]+$/, '');
      
      // Include folder if it exists
      return publicId;
    } catch (error) {
      console.error('Error extracting public_id:', error);
      return null;
    }
  };

  return {
    upload,
    deleteImage,
    isUploading,
    progress,
  };
}
