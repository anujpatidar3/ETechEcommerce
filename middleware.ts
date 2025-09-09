import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Skip middleware for login page
    if (
      request.nextUrl.pathname === "/admin" ||
      request.nextUrl.pathname === "/login"
    ) {
      return NextResponse.next();
    }

    const token = request.cookies.get("token")?.value;

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decoded = verifyToken(token);
      if (!decoded || decoded.accessLevel !== "Admin") {
        // Redirect to login if not admin
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch (error) {
      // Redirect to login if token is invalid
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
