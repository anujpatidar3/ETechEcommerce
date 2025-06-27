/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  // For signed uploads, upload preset is not needed on frontend
  // readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
