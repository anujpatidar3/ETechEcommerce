import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export interface AuthenticatedUser {
  userId: string;
  username: string;
  accessLevel: string;
}

export async function authenticateAdmin(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.accessLevel !== "Admin") {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}
