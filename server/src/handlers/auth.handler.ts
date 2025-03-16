import type { Context } from 'hono';
import * as authService from "../services/auth.service";
import { setCookie } from "hono/cookie";
import { ValidationError } from "../errors/AppError";

/**
 * Handle user registration
 */
export const register = async (c: Context) => {
  const data = await c.req.json();
  const { user, accessToken, refreshToken } = await authService.register(data);

  // Set cookies
  setCookie(c, "access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });
  
  setCookie(c, "refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return c.json({
    status: "success",
    data: {
      user: userWithoutPassword,
      accessToken, // Include token in response for non-cookie clients
    },
  }, 201);
};

/**
 * Handle user login
 */
export const login = async (c: Context) => {
  const data = await c.req.json();
  const { user, accessToken, refreshToken } = await authService.login(data);

  // If two-factor auth is enabled, don't set the cookie
  if (user.isTwoFactorEnabled) {
    return c.json({
      status: 'success',
      data: {
        user: {
          email: user.email,
          isTwoFactorEnabled: user.isTwoFactorEnabled
        }
      }
    }, 200);
  }

  // Set cookies
  setCookie(c, "access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });
  
  setCookie(c, "refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  // Also add token to response for clients that can't use cookies
  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return c.json({
    status: 'success',
    message: 'Logged in successfully',
    data: {
      user: userWithoutPassword,
      accessToken, // Include token in response for non-cookie clients
    }
  }, 200);
};

/**
 * Handle user logout
 */
export const logout = async (c: Context) => {
  // Get refresh token from cookie
  const refreshToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (refreshToken) {
    // Invalidate the refresh token
    await authService.invalidateRefreshToken(refreshToken);
  }
  
  // Clear cookies
  setCookie(c, 'access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expires immediately
  });
  
  setCookie(c, 'refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expires immediately
  });

  console.log("Logged out successfully");

  return c.json({
    status: 'success',
    message: 'Logged out successfully'
  }, 200);
};

/**
 * Verify user email
 */
export const verifyEmail = async (c: Context) => {
  const data = await c.req.json();
  const user = await authService.verifyEmail(data);

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return c.json({
    status: 'success',
    data: {
      user: userWithoutPassword
    }
  }, 200);
};

/**
 * Handle password reset request
 */
export const resetPassword = async (c: Context) => {
  const data = await c.req.json();
  await authService.resetPassword(data);

  return c.json({
    status: 'success',
    message: 'If your email is registered, you will receive a password reset link'
  }, 200);
};

/**
 * Handle setting new password
 */
export const newPassword = async (c: Context) => {
  const data = await c.req.json();
  await authService.newPassword(data);

  return c.json({
    status: 'success',
    message: 'Your password has been updated'
  }, 200);
};

/**
 * Handle two-factor token verification
 */
export const verifyTwoFactorToken = async (c: Context) => {
  const data = await c.req.json();
  const { accessToken, refreshToken } = await authService.verifyTwoFactorToken(data);

  // Set cookies
  setCookie(c, "access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });
  
  setCookie(c, "refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return c.json({
    status: 'success',
    message: 'Two-factor authentication successful',
    data: {
      accessToken,
    }
  }, 200);
};

/**
 * Refresh access token
 */
export const refreshToken = async (c: Context) => {
  // Get refresh token from cookie or request body
  let refreshToken = c.req.header('Authorization')?.split(' ')[1];
  
  // If not in cookie, check request body
  if (!refreshToken) {
    const data = await c.req.json();
    refreshToken = data.refreshToken;
  }
  
  if (!refreshToken) {
    return c.json({
      status: 'error',
      message: 'Refresh token is required'
    }, 400);
  }
  
  try {
    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken({ refreshToken });
    
    // Set cookies
    setCookie(c, "access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });
    
    setCookie(c, "refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    
    return c.json({
      status: 'success',
      data: {
        accessToken,
      }
    }, 200);
  } catch (error) {
    // Clear cookies on error
    setCookie(c, 'access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    
    setCookie(c, 'refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    
    return c.json({
      status: 'error',
      message: 'Invalid refresh token'
    }, 401);
  }
};

/**
 * Get current user
 */
export const me = async (c: Context) => {
  const user = c.get('user');

  if (!user) {
    throw new ValidationError('User not found');
  }

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return c.json({
    status: 'success',
    data: {
      user: userWithoutPassword
    }
  }, 200);
};

/**
 * Handle resend verification email
 */
export const handleResendVerification = async (c: Context) => {
  const data = await c.req.json();
  await authService.resendVerification(data.email);

  return c.json({
    status: 'success',
    message: 'If your email is registered, a new verification email has been sent'
  }, 200);
};

/**
 * Send login verification code
 */
export const sendLoginVerificationCode = async (c: Context) => {
  const data = await c.req.json();
  await authService.sendLoginVerificationCode(data.email);

  return c.json({
    status: 'success',
    message: 'If your email is registered, a verification code has been sent'
  }, 200);
};

/**
 * Verify login code
 */
export const verifyLoginCode = async (c: Context) => {
  const data = await c.req.json();
  const { user, accessToken, refreshToken } = await authService.verifyLoginCode(data);

  // Set cookies
  setCookie(c, "access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });
  
  setCookie(c, "refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return c.json({
    status: 'success',
    message: 'Login verification successful',
    data: {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    }
  }, 200);
}; 