import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const newPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const twoFactorSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().min(6, "Code must be at least 6 characters"),
});

export const verifyTotpSchema = z.object({
  code: z.string().length(6, "TOTP code must be exactly 6 digits"),
});

export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type TwoFactorInput = z.infer<typeof twoFactorSchema>;
export type VerifyTotpInput = z.infer<typeof verifyTotpSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>; 