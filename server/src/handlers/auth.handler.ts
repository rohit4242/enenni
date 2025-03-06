import type { Context } from 'hono';
import * as authService from "../services/auth.service";
import { setCookie } from "hono/cookie";
import { ValidationError } from "../errors/AppError";

/**
 * Handle user registration
 */
export const register = async (c: Context) => {
  const data = await c.req.json();
  const { user, token } = await authService.register(data);

  // Set cookie
  setCookie(c, "token", token, {
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
    },
  }, 201);
};

/**
 * Handle user login
 */
export const login = async (c: Context) => {
  const data = await c.req.json();
  const { user, token } = await authService.login(data);

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

  // Set cookie
  setCookie(c, 'token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });


  // Also add token to response for clients that can't use cookies
  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return c.json({
    status: 'success',
    data: {
      user: userWithoutPassword,
      token: token // Include token in response for non-cookie clients
    }
  }, 200);
};

/**
 * Handle user logout
 */
export const logout = async (c: Context) => {
  // Clear cookie
  setCookie(c, 'token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expires immediately
  });

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
  const { token } = await authService.verifyTwoFactorToken(data);

  // Set cookie
  setCookie(c, 'token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return c.json({
    status: 'success',
    message: 'Two-factor authentication successful'
  }, 200);
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
 * Handle resend verification
 */
export const resendVerification = async (c: Context) => {
  const data = await c.req.json();
  await authService.resendVerification(data.email);

  return c.json({
    status: 'success',
    message: 'If your email is registered, a new verification link has been sent'
  }, 200);
}; 