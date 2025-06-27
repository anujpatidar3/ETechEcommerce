# ETechEcommerce Frontend

## Setup

1. `cd client`
2. `npm install`
3. **Set up image upload** (required for admin functionality):
   - See `IMAGE_UPLOAD_SETUP.md` for detailed Cloudinary setup instructions
   - Copy `.env.example` to `.env` and configure your Cloudinary credentials

## Development

1. `npm run dev` (for development)
2. `npm run build` (for production build)
3. `npm run preview` (to preview production build)

## Features

- **Product Management**: Create, edit, and delete products with image upload
- **Image Upload**: Drag & drop or browse to upload product images via Cloudinary
- **Responsive Design**: Works on desktop and mobile devices
- **Admin Dashboard**: Full product and brand management interface

## Deployment

Deploy the `client` folder to Vercel or any static hosting provider. See `README-vercel.md` for Vercel-specific instructions.

Make sure to add your environment variables to your deployment platform.
