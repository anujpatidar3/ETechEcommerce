import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateAdmin } from "@/lib/middleware";
import { hashPassword } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const adminUser = await authenticateAdmin();
    if (!adminUser) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { username, password, accessLevel } = body;

    const updateData: any = {};

    if (username) {
      // Check if another user with same username exists
      const existingUser = await User.findOne({
        username,
        _id: { $ne: params.id },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "Username already exists" },
          { status: 400 }
        );
      }
      updateData.username = username;
    }

    if (password) {
      updateData.password = await hashPassword(password);
    }

    if (accessLevel) {
      updateData.accessLevel = accessLevel;
    }

    const user = await User.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const adminUser = await authenticateAdmin();
    if (!adminUser) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Don't allow deleting the main admin user
    const userToDelete = await User.findById(params.id);
    if (!userToDelete) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (userToDelete.username === "admin") {
      return NextResponse.json(
        { message: "Cannot delete the main admin user" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(params.id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
