import { z } from 'zod';
import { Role } from '@prisma/client';

export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  image: z.string().url('Invalid image URL').optional().nullable(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(Role),
});

export const verifyTwoFactorSchema = z.object({
  code: z.string().min(6).max(6),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type VerifyTwoFactorInput = z.infer<typeof verifyTwoFactorSchema>; 