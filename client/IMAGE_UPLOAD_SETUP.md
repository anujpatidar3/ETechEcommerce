# Image Upload Setup Instructions

This application uses Cloudinary for image upload functionality. Follow these steps to set it up:

## Cloudinary Setup

1. **Create a Cloudinary Account**
   - Go to [https://cloudinary.com](https://cloudinary.com)
   - Sign up for a free account

2. **Get Your Cloud Name**
   - After logging in, go to your Dashboard
   - Copy your "Cloud name" (it's usually displayed prominently)

3. **Create an Upload Preset**
   - Go to Settings → Upload
   - Click "Add upload preset"
   - Set the following:
     - Preset name: `etech_products_preset` (or any name you prefer)
     - Signing Mode: **Unsigned**
     - Folder: `etech-products` (optional, helps organize uploads)
   - Save the preset

4. **Configure Environment Variables**
   - Copy `.env.example` to `.env` in the client directory:
     ```bash
     cp .env.example .env
     ```
   - Edit the `.env` file and add your values:
     ```
     VITE_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
     VITE_CLOUDINARY_UPLOAD_PRESET=etech_products_preset
     ```

5. **Restart the Development Server**
   ```bash
   npm run dev
   ```

## Features

- **Drag & Drop Upload**: Users can drag images directly onto the upload area
- **File Browser**: Click to open file browser and select images
- **URL Input**: Alternative option to enter image URLs directly
- **Image Preview**: Shows preview of selected/uploaded images
- **Progress Indicator**: Shows upload progress
- **File Validation**: Validates file type and size
- **Error Handling**: User-friendly error messages

## Supported File Types

- PNG
- JPG/JPEG
- GIF
- Maximum file size: 5MB (configurable)

## Folder Organization

Uploaded images are automatically organized in the `etech-products` folder in your Cloudinary media library for easy management.

## Troubleshooting

- **"Configuration Error"**: Make sure your `.env` file exists and contains the correct values
- **Upload fails**: Check your upload preset is set to "unsigned" mode
- **CORS errors**: Cloudinary should handle CORS automatically for image uploads

## Security Note

The upload preset is set to "unsigned" mode for simplicity. For production applications, consider implementing signed uploads for better security.
