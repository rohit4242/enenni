import type { Context } from 'hono';
import * as userService from '../services/user.service';
import { ValidationError } from '../errors/AppError';

export const getProfile = async (c: Context) => {
  const user = c.get('user');

  if (!user) {
    throw new ValidationError('User not found');
  }

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return c.json({
    success: true,
    data: {
      user: userWithoutPassword,
    },
  });
};

export const updateProfile = async (c: Context) => {
  const user = c.get('user');

  if (!user) {
    throw new ValidationError('User not found');
  }

  const data = await c.req.json();
  const updatedUser = await userService.updateUserProfile(user.id, data);

  // Remove password from response
  const { password, ...userWithoutPassword } = updatedUser;

  return c.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: userWithoutPassword,
    },
  });
};

export const updatePassword = async (c: Context) => {
  const user = c.get('user');

  if (!user) {
    throw new ValidationError('User not found');
  }

  const data = await c.req.json();
  await userService.updatePassword(user.id, data);

  return c.json({
    success: true,
    message: 'Password updated successfully',
  });
};

export const enableTwoFactor = async (c: Context) => {
  const user = c.get('user');

  if (!user) {
    throw new ValidationError('User not found');
  }

  const updatedUser = await userService.enableTwoFactor(user.id);

  return c.json({
    success: true,
    message: 'Two-factor authentication enabled',
    data: {
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      // Include QR code if available
      mfaQrCode: updatedUser.mfaQrCode,
      mfaSecret: updatedUser.mfaSecret,
    },
  });
};

export const disableTwoFactor = async (c: Context) => {
  const user = c.get('user');

  if (!user) {
    throw new ValidationError('User not found');
  }

  const updatedUser = await userService.disableTwoFactor(user.id);

  return c.json({
    success: true,
    message: 'Two-factor authentication disabled',
    data: {
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
    },
  });
};

export const verifyTwoFactor = async (c: Context) => {
  const user = c.get('user');

  if (!user) {
    throw new ValidationError('User not found');
  }

  const data = await c.req.json();
  const isValid = await userService.verifyTwoFactorCode(user.id, data.code);

  // Create two-factor confirmation after successful verification
  if (isValid) {
    await userService.createTwoFactorConfirmation(user.id);
  }

  return c.json({
    success: true,
    message: 'Two-factor authentication verified successfully',
    data: {
      verified: isValid
    }
  });
};

// Admin only handlers
export const getAllUsers = async (c: Context) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');

  const { users, total } = await userService.getAllUsers(page, limit);

  // Remove passwords from response
  const usersWithoutPasswords = users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  return c.json({
    success: true,
    data: {
      users: usersWithoutPasswords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
};

export const getUserById = async (c: Context) => {
  const userId = c.req.param('id');
  const user = await userService.getUserById(userId);

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return c.json({
    success: true,
    data: {
      user: userWithoutPassword,
    },
  });
};

export const updateUserRole = async (c: Context) => {
  const data = await c.req.json();
  const updatedUser = await userService.updateUserRole(data);

  // Remove password from response
  const { password, ...userWithoutPassword } = updatedUser;

  return c.json({
    success: true,
    message: 'User role updated successfully',
    data: {
      user: userWithoutPassword,
    },
  });
}; 