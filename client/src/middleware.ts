import { NextRequest, NextResponse } from "next/server";

// Define route groups
const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/new-password",
  "/auth/reset",
  "/auth/error",
];

const protectedRoutes = [
  "/", // Root is protected
  "/orders",
  "/settings",
  "/balances",
  "/wallets",
];

// Authentication flow routes
const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  EMAIL_VERIFICATION: "/auth/verify-email",
  LOGIN_VERIFICATION: "/auth/login-verification",
  DASHBOARD: "/",
};

// Cookie names for tracking auth state
const COOKIES = {
  ACCESS_TOKEN: "access_token",
  EMAIL_VERIFIED: "email_verified",
  LOGIN_VERIFIED: "login_verified",
  AUTH_STAGE: "auth_stage", // Tracks where user is in auth flow
  USER_EMAIL: "user_email",
  FIRST_LOGIN_AFTER_EMAIL_VERIFICATION: "first_login_after_verification", // New cookie to track first login after email verification
  PENDING_EMAIL_VERIFICATION: "pending_email_verification", // Track if user just registered and needs to verify email
};

// Auth stages to track progress
enum AuthStage {
  REGISTERED = "registered",
  EMAIL_VERIFIED = "email_verified",
  LOGIN_VERIFIED = "login_verified",
  COMPLETE = "complete",
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  
  // Get authentication state from cookies
  const token = request.cookies.get(COOKIES.ACCESS_TOKEN)?.value;
  const isEmailVerified = request.cookies.get(COOKIES.EMAIL_VERIFIED)?.value === "true";
  const isLoginVerified = request.cookies.get(COOKIES.LOGIN_VERIFIED)?.value === "true";
  const authStage = request.cookies.get(COOKIES.AUTH_STAGE)?.value as AuthStage | undefined;
  const isFirstLoginAfterVerification = request.cookies.get(COOKIES.FIRST_LOGIN_AFTER_EMAIL_VERIFICATION)?.value === "true";
  const isPendingEmailVerification = request.cookies.get(COOKIES.PENDING_EMAIL_VERIFICATION)?.value === "true";
  
  // Fully authenticated users can access protected routes
  const isFullyAuthenticated = token && isEmailVerified && isLoginVerified;
  
  // 1. Handle public routes (login, register, etc.)
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // If user is fully authenticated, redirect to dashboard
    if (isFullyAuthenticated && !pathname.includes("error")) {
      return NextResponse.redirect(new URL(AUTH_ROUTES.DASHBOARD, request.url));
    }
    
    return NextResponse.next();
  }
  
  // 2. Handle email verification route
  if (pathname.startsWith(AUTH_ROUTES.EMAIL_VERIFICATION)) {
    // Allow access if user just registered or is registered but email not verified
    if (isPendingEmailVerification || (token && !isEmailVerified)) {
      return NextResponse.next();
    }
    
    // If email already verified, redirect to login page
    if (isEmailVerified) {
      // Set a cookie to indicate this is the first login after email verification
      const loginRedirect = NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, request.url));
      loginRedirect.cookies.set(COOKIES.FIRST_LOGIN_AFTER_EMAIL_VERIFICATION, "true", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10, // 10 minutes
      });
      return loginRedirect;
    }
    
    // Otherwise redirect to login
    return NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, request.url));
  }
  
  // 3. Handle login verification route
  if (pathname.startsWith(AUTH_ROUTES.LOGIN_VERIFICATION)) {
    // Check if user just verified email - if so, redirect to login page
    if (isFirstLoginAfterVerification) {
      return NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, request.url));
    }
    
    // Allow access if user has token and email is verified and it's not the first login after verification
    if (token && isEmailVerified && !isLoginVerified && !isFirstLoginAfterVerification) {
      return NextResponse.next();
    }
    
    // If already login verified, redirect to dashboard
    if (token && isEmailVerified && isLoginVerified) {
      return NextResponse.redirect(new URL(AUTH_ROUTES.DASHBOARD, request.url));
    }
    
    // Otherwise redirect to appropriate stage
    if (!token) {
      return NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, request.url));
    } else if (!isEmailVerified) {
      return NextResponse.redirect(new URL(AUTH_ROUTES.EMAIL_VERIFICATION, request.url));
    }
  }
  
  // 4. Protected routes handling
  if (protectedRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    // No token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, request.url));
    }
    
    // Email not verified, redirect to verification
    if (!isEmailVerified) {
      // Set pending verification cookie to ensure user can access the verification page
      const verifyRedirect = NextResponse.redirect(new URL(AUTH_ROUTES.EMAIL_VERIFICATION, request.url));
      verifyRedirect.cookies.set(COOKIES.PENDING_EMAIL_VERIFICATION, "true", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60, // 1 day
      });
      return verifyRedirect;
    }
    
    // Check if it's first login after email verification
    if (isFirstLoginAfterVerification) {
      // Clear the first login after verification cookie
      const loginRedirect = NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, request.url));
      loginRedirect.cookies.set(COOKIES.FIRST_LOGIN_AFTER_EMAIL_VERIFICATION, "", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0, // Expire immediately
      });
      return loginRedirect;
    }
    
    // Login not verified, redirect to login verification
    // But only if there's no verification=complete in the URL or referrer
    if (!isLoginVerified) {
      // Check if this is a post-verification navigation by looking at referrer or URL params
      const referer = request.headers.get('referer') || '';
      const hasVerificationComplete = 
        referer.includes('verification=complete') || 
        request.nextUrl.searchParams.has('verification');
        
      // If this is right after verification, go to login instead of login-verification
      if (hasVerificationComplete) {
        return NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, request.url));
      }
      
      // Otherwise proceed with normal flow to login-verification
      const userEmail = request.cookies.get(COOKIES.USER_EMAIL)?.value;
      const redirectUrl = new URL(AUTH_ROUTES.LOGIN_VERIFICATION, request.url);
      
      if (userEmail) {
        redirectUrl.searchParams.set("email", userEmail);
      }
      
      return NextResponse.redirect(redirectUrl);
    }
    
    // Update auth stage if needed
    if (authStage !== AuthStage.COMPLETE && isFullyAuthenticated) {
      response.cookies.set(COOKIES.AUTH_STAGE, AuthStage.COMPLETE, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }
    
    // All checks passed, proceed
    return response;
  }
  
  // Default - allow access
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Apply to all routes except api, _next, and static files
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}
