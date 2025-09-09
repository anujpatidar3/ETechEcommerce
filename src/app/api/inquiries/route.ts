import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const data = await request.json();

    const inquiry = await Inquiry.create(data);

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error("Create inquiry error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
