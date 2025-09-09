import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import Inquiry from "@/models/Inquiry";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get counts for all collections
    const [productCount, categoryCount, brandCount, inquiryCount] =
      await Promise.all([
        Product.countDocuments(),
        Category.countDocuments(),
        Brand.countDocuments(),
        Inquiry.countDocuments(),
      ]);

    return NextResponse.json({
      products: productCount,
      categories: categoryCount,
      brands: brandCount,
      inquiries: inquiryCount,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
