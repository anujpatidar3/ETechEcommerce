import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateAdmin } from "@/lib/middleware";
import { hashPassword } from "@/lib/auth";

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

    const body = await request.json();
    const { username, password, accessLevel = "User" } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      username,
      password: hashedPassword,
      accessLevel,
    });

    const savedUser = await newUser.save();

    // Remove password from response
    const { password: _, ...userResponse } = savedUser.toObject();

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminUser = await authenticateAdmin();
    if (!adminUser) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
