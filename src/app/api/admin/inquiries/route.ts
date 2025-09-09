import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { authenticateAdmin } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateAdmin();
    if (!user) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });

    return NextResponse.json(inquiries);
  } catch (error) {
    console.error("Get inquiries error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticateAdmin();
    if (!user) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Inquiry ID is required" },
        { status: 400 }
      );
    }

    const inquiry = await Inquiry.findByIdAndDelete(id);

    if (!inquiry) {
      return NextResponse.json(
        { message: "Inquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Inquiry deleted successfully" });
  } catch (error) {
    console.error("Delete inquiry error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
