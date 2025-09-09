import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { authenticateAdmin } from "@/lib/middleware";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
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

    const product = await Product.create(data);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
