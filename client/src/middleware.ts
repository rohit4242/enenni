import NextAuth from "next-auth";

import authConfig from "./auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "./routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isSumsubRoute = nextUrl.pathname.startsWith('/api/sumsub');
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isSumsubRoute) {
    return;
  }

  if (isApiAuthRoute) {
    return;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  // if (isLoggedIn && !isPublicRoute && !isAuthRoute) {
  //   if (user?.kycStatus !== "APPROVED") {
  //     return Response.redirect(new URL("/kyc", nextUrl));
  //   }
  // }

  return;
}) as any; // temporary fix for type issues with beta

export const config = {
  matcher: [
    // Match all paths except static assets, public folder, etc.
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|images|public).*)",
  ],
};

