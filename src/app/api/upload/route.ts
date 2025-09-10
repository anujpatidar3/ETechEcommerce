import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const oldImageUrl = formData.get("oldImageUrl") as string;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Delete old image if exists
    if (oldImageUrl) {
      try {
        const publicId = extractPublicIdFromUrl(oldImageUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (error) {
        console.error("Error deleting old image:", error);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "etech-products",
            resource_type: "auto",
            transformation: [
              { width: 800, height: 600, crop: "limit" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      message: "Image uploaded successfully",
      imageUrl: (result as any).secure_url,
      publicId: (result as any).public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("imageUrl");

    if (!imageUrl) {
      return NextResponse.json(
        { message: "No image URL provided" },
        { status: 400 }
      );
    }

    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
      return NextResponse.json(
        { message: "Invalid image URL" },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { message: "Failed to delete image" },
      { status: 500 }
    );
  }
}

function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Extract public ID from Cloudinary URL
    const urlParts = url.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");
    if (uploadIndex === -1) return null;

    // Get the part after version (if exists) or after upload
    let publicIdPart = urlParts.slice(uploadIndex + 1).join("/");

    // Remove version if present (v1234567890)
    publicIdPart = publicIdPart.replace(/^v\d+\//, "");

    // Remove file extension
    const lastDotIndex = publicIdPart.lastIndexOf(".");
    if (lastDotIndex > 0) {
      publicIdPart = publicIdPart.substring(0, lastDotIndex);
    }

    return publicIdPart;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
}
