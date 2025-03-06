import prisma from '../lib/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { AuthenticationError, NotFoundError, ValidationError } from '../errors/AppError';
import type { 
  UserProfileInput, 
  UpdatePasswordInput, 
  UpdateUserRoleInput 
} from '../schemas/user.schema';
import type { User } from '@prisma/client';
import * as emailService from './email.service';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Get a user by ID
 */
export const getUserById = async (id: string): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> => {
  const skip = (page - 1) * limit;
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.count(),
  ]);

  return { users, total };
};

/**
 * Update a user's profile
 */
export const updateUserProfile = async (userId: string, data: UserProfileInput): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return await prisma.user.update({
    where: { id: userId },
    data,
  });
};

/**
 * Update a user's password
 */
export const updatePassword = async (userId: string, data: UpdatePasswordInput): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.password) {
    throw new NotFoundError('User not found');
  }

  // Verify current password
  const isPasswordValid = await verifyPassword(data.currentPassword, user.password);

  if (!isPasswordValid) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Hash the new password
  const hashedPassword = await hashPassword(data.newPassword);

  // Update the password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });
};

/**
 * Update a user's role (admin only)
 */
export const updateUserRole = async (data: UpdateUserRoleInput): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return await prisma.user.update({
    where: { id: data.userId },
    data: {
      role: data.role,
    },
  });
};

/**
 * Enable two-factor authentication for a user
 */
export const enableTwoFactor = async (userId: string): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Generate two-factor secret using speakeasy
  const secret = speakeasy.generateSecret({
    name: `Enenni:${user.email}`,
    issuer: 'Enenni'
  });
  
  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || '');

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      isTwoFactorEnabled: true,
      mfaSecret: secret.base32, // Store base32 encoded secret
      mfaQrCode: qrCodeDataUrl,
    },
  });

  // Send email notification
  if (user.email) {
    await emailService.sendTwoFactorEnabledEmail(user.email);
  }

  return updatedUser;
};

/**
 * Disable two-factor authentication for a user
 */
export const disableTwoFactor = async (userId: string): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Delete two-factor confirmation if it exists
  if (user.isTwoFactorEnabled) {
    await prisma.twoFactorConfirmation.delete({
      where: { userId },
    });
  }

  return await prisma.user.update({
    where: { id: userId },
    data: {
      isTwoFactorEnabled: false,
      mfaSecret: null,
      mfaQrCode: null,
    },
  });
};

/**
 * Verify a two-factor authentication code
 */
export const verifyTwoFactorCode = async (userId: string, code: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.isTwoFactorEnabled || !user.mfaSecret) {
    throw new ValidationError('Two-factor authentication is not enabled for this user');
  }

  // Verify the code using speakeasy
  const isCodeValid = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token: code,
    window: 4 // Allow codes from 30 seconds ago and 30 seconds in the future
  });

  if (!isCodeValid) {
    throw new AuthenticationError('Invalid two-factor authentication code');
  }

  return isCodeValid;
};

/**
 * Create two-factor confirmation for a user after successful verification
 */
export const createTwoFactorConfirmation = async (userId: string): Promise<void> => {
  await prisma.twoFactorConfirmation.create({
    data: {
      userId
    }
  });
};

/**
 * Check if a user has a valid two-factor confirmation
 */
export const hasTwoFactorConfirmation = async (userId: string): Promise<boolean> => {
  const confirmation = await prisma.twoFactorConfirmation.findUnique({
    where: { userId }
  });
  
  return !!confirmation;
}; 