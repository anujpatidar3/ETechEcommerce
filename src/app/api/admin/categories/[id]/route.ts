import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { authenticateAdmin } from "@/lib/middleware";
import { slugify } from "@/lib/utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateAdmin();
    if (!user) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const data = await request.json();

    // Generate slug if not provided
    if (!data.slug) {
      data.slug = slugify(data.name);
    }

    const category = await Category.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Update category error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Category slug already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateAdmin();
    if (!user) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const category = await Category.findByIdAndDelete(params.id);

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
