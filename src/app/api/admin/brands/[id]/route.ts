import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Brand from "@/models/Brand";
import { authenticateAdmin } from "@/lib/middleware";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateAdmin();
    if (!user) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    // Check if another brand with same name already exists
    const existingBrand = await Brand.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      _id: { $ne: params.id },
    });

    if (existingBrand) {
      return NextResponse.json(
        { message: "Brand with this name already exists" },
        { status: 400 }
      );
    }

    const brand = await Brand.findByIdAndUpdate(
      params.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!brand) {
      return NextResponse.json({ message: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Update brand error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateAdmin();
    if (!user) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const brand = await Brand.findByIdAndDelete(params.id);

    if (!brand) {
      return NextResponse.json({ message: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Delete brand error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
