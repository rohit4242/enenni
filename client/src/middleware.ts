import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to handle authentication and protected routes
 */
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // Get auth token from cookies
  const token = request.cookies.get("token")?.value;
  const isAuthenticated = !!token;
  
  // Check email verification status from cookie
  const emailVerified = request.cookies.get("emailVerified")?.value === "true";

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes("favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Skip redirect for verification pages, even if user is authenticated
  if (
    pathname.startsWith("/auth/verify-email")
  ) {
    return NextResponse.next();
  }

  // 1. Auth routes - redirect to dashboard if already logged in
  const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/reset-password",
  ];

  // 2. Protected routes - require authentication
  const protectedPrefixes = ["/dashboard", "/profile", "/settings", "/account"];

  // Check if path is an auth route
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if path is under a protected prefix
  const isProtectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Handle auth routes - redirect to dashboard if already logged in
  if (isAuthRoute) {
    if (isAuthenticated) {
      // If authenticated but not verified, redirect to verification pending page
      if (!emailVerified) {
        return NextResponse.redirect(new URL("/auth/verify-email", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes - redirect to login if not authenticated
  if (isProtectedRoute) {
    if (!isAuthenticated) {
      const url = new URL("/auth/login", request.url);
      
      // Store the original URL as a callback URL in a cookie
      const response = NextResponse.redirect(url);
      
      // Set a cookie with the callback URL
      response.cookies.set({
        name: "loginCallbackUrl",
        value: request.nextUrl.pathname,
        path: "/",
        maxAge: 60 * 60, // 1 hour
        sameSite: "lax",
      });
      
      return response;
    }
    
    // If authenticated but not verified, redirect to verification pending page
    if (!emailVerified) {
      return NextResponse.redirect(new URL("/auth/verify-email", request.url));
    }
    
    return NextResponse.next();
  }

  // Handle root path
  if (pathname === "/") {
    if (isAuthenticated) {
      // If authenticated but not verified, redirect to verification pending page
      if (!emailVerified) {
        return NextResponse.redirect(new URL("/auth/verify-email", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Handle redirects for other auth pages
  if (isAuthenticated && pathname.startsWith("/auth")) {
    // If authenticated but not verified, redirect to verification pending page
    if (!emailVerified && !pathname.startsWith("/auth/verify-email")) {
      return NextResponse.redirect(new URL("/auth/verify-email", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For all other paths, allow access
  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on
 * Use a broad matcher that excludes static assets and API routes
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};