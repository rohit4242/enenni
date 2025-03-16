import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/",  // Root is now protected
  "/orders",
  "/settings",
  "/balances",
  "/wallets",
];

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/new-password",
  "/auth/verify-email",
  "/auth/reset",
  "/auth/error",
];

// Routes that require email verification
const verificationRequiredRoutes = [
  "/",
  "/orders",
  "/settings",
  "/balances",
  "/wallets",
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Skip middleware for APIs and static files
  if (path.startsWith("/api/") || path.includes(".")) {
    return NextResponse.next();
  }

  // More flexible matching using .some() and startsWith
  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  const isPublicRoute =
    publicRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`)
    ) || path.startsWith("/auth/"); // Allow all auth paths

  const accessToken = req.cookies.get("access_token")?.value;
  
  // Check if email is verified (stored in a cookie)
  const isEmailVerified = req.cookies.get("email_verified")?.value === "true";
  
  // For protected routes, redirect to login if no token
  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
  }
  
  // For routes requiring verification, redirect to verification page if email not verified
  const requiresVerification = verificationRequiredRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
  
  if (requiresVerification && accessToken && !isEmailVerified) {
    return NextResponse.redirect(new URL("/auth/verify-email", req.nextUrl));
  }

  // For public routes, redirect to home (dashboard) if already logged in and verified
  if (isPublicRoute && accessToken && isEmailVerified && path !== "/auth/verify-email") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // For all other routes, proceed normally
  return NextResponse.next();
}

// Add matcher config to restrict where middleware runs
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
