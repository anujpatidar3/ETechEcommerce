import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import { authenticateAdmin } from "@/lib/middleware";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const user = await authenticateAdmin();
    if (!user) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const user = await authenticateAdmin();
    if (!user) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Ensure Category model is registered before populate
    Category;

    const body = await request.json();
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      brand,
      categoryId,
      imageUrl,
      rating,
      inStock,
      featured,
      specifications,
    } = body;

    // Validate required fields
    if (!name || !slug || !price || !brand || !categoryId || !imageUrl) {
      console.log("Missing required fields validation failed:", {
        name: !!name,
        slug: !!slug,
        price: !!price,
        brand: !!brand,
        categoryId: !!categoryId,
        imageUrl: !!imageUrl,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndUpdate(
      params.id,
      {
        name,
        slug,
        description: description || "",
        price,
        originalPrice: originalPrice || "",
        brand,
        categoryId,
        imageUrl,
        rating: rating || "",
        inStock: inStock !== undefined ? inStock : true,
        featured: featured || false,
        specifications: specifications || "",
      },
      { new: true }
    ).populate("categoryId", "name slug");

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
