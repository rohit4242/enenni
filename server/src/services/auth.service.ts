import prisma from "../lib/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { generateTokenPair, jwtVerify } from "../utils/jwt";
import {
  generatePasswordResetToken,
  generateVerificationToken,
  generateTwoFactorToken,
} from "../utils/token";
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../errors/AppError";
import type {
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  NewPasswordInput,
  VerifyEmailInput,
  TwoFactorInput,
  RefreshTokenInput,
  LoginVerificationInput,
  VerifyLoginCodeInput,
} from "../schemas/auth.schema";
import { CryptoType, type User } from "@prisma/client";
import * as emailService from "./email.service";
import speakeasy from "speakeasy";

/**
 * Register a new user
 */
export const register = async (
  data: RegisterInput
): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError("User with this email already exists");
  }

  // Hash the password
  const hashedPassword = await hashPassword(data.password);

  // Create the user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      isEntity: data.isEntity,
    },
  });

  console.log("User created:", user);

  // Generate verification token
  const verificationToken = generateVerificationToken(data.email);
  console.log("Verification token:", verificationToken);
  // Save verification token
  await prisma.verificationToken.create({
    data: verificationToken,
  });
  console.log("Verification token saved:", verificationToken);

  // Send verification email
  await emailService.sendVerificationEmail(data.email, verificationToken.token);
  console.log("Verification email sent:", data.email, verificationToken.token);
  // Initialize balances for the new user
  await initializeUserBalances(user.id);

  // Generate JWT tokens
  const { accessToken, refreshToken } = await generateTokenPair({
    userId: user.id,
    email: user.email!,
  });

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expires: expiresAt,
    },
  });

  return { user, accessToken, refreshToken };
};

/**
 * Login a user
 */
export const login = async (
  data: LoginInput
): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      twoFactorConfirmation: true,
    },
  });

  if (!user || !user.password) {
    throw new AuthenticationError("Invalid credentials");
  }

  // Verify password
  const isPasswordValid = await verifyPassword(data.password, user.password);

  if (!isPasswordValid) {
    throw new AuthenticationError("Invalid credentials");
  }

  // Check if two-factor authentication is enabled
  if (user.isTwoFactorEnabled) {
    if (!user.twoFactorConfirmation) {
      // Return user with minimal info - frontend should redirect to 2FA verification
      return {
        user: {
          id: user.id,
          email: user.email,
          isTwoFactorEnabled: true,
          // Add necessary fields only
          isEntity: user.isEntity,
          name: null,
          emailVerified: null,
          password: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          image: null,
          kycStatus: null,
          sumsubApplicantId: null,
          kycSubmittedAt: null,
          kycApprovedAt: null,
          role: null,
          mfaEnabled: false,
          mfaSecret: null,
          mfaQrCode: null,
        },
        accessToken: "",
        refreshToken: "",
      };
    }
  }

  // Generate JWT tokens
  const { accessToken, refreshToken } = await generateTokenPair({
    userId: user.id,
    email: user.email!,
  });

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expires: expiresAt,
    },
  });

  return { user, accessToken, refreshToken };
};

/**
 * Verify a user's email
 */
export const verifyEmail = async (data: VerifyEmailInput): Promise<User> => {
  // Find the verification token
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      email: data.email,
      token: data.code,
    },
  });

  if (!verificationToken) {
    throw new ValidationError("Invalid or expired verification code");
  }

  // Check if token is expired
  if (new Date() > verificationToken.expires) {
    throw new ValidationError("Verification code has expired");
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: verificationToken.email },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Update user's email verification status
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  // Delete the verification token
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  return updatedUser;
};

/**
 * Reset a user's password
 */
export const resetPassword = async (
  data: ResetPasswordInput
): Promise<void> => {
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    // We don't want to reveal if the email exists or not for security reasons
    return;
  }

  // Generate password reset token
  const resetToken = generatePasswordResetToken(data.email);

  // Save password reset token
  await prisma.passwordResetToken.create({
    data: resetToken,
  });

  // Send password reset email
  await emailService.sendPasswordResetEmail(data.email, resetToken.token);
};

/**
 * Set a new password with a reset token
 */
export const newPassword = async (data: NewPasswordInput): Promise<void> => {
  // Find the password reset token
  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      token: data.token,
    },
  });

  if (!resetToken) {
    throw new ValidationError("Invalid or expired password reset token");
  }

  // Check if token is expired
  if (new Date() > resetToken.expires) {
    throw new ValidationError("Password reset token has expired");
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: resetToken.email },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Hash the new password
  const hashedPassword = await hashPassword(data.password);

  // Update the user's password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Delete the token
  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id },
  });

  // Send password reset success email
  await emailService.sendPasswordResetSuccessEmail(
    user.email ?? "" // Use empty string as fallback if email is null
  );
};

/**
 * Verify a two-factor authentication token
 */
export const verifyTwoFactorToken = async (
  data: TwoFactorInput
): Promise<{ accessToken: string; refreshToken: string }> => {
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (!user.isTwoFactorEnabled || !user.mfaSecret) {
    throw new ValidationError(
      "Two-factor authentication is not enabled for this user"
    );
  }

  // Verify the code using speakeasy
  const isValid = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: "base32",
    token: data.code,
    window: 1, // Allow codes from 30 seconds ago and 30 seconds in the future
  });

  if (!isValid) {
    throw new AuthenticationError("Invalid two-factor code");
  }

  // Create or update two-factor confirmation
  await prisma.twoFactorConfirmation.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });

  // Generate JWT tokens
  const { accessToken, refreshToken } = await generateTokenPair({
    userId: user.id,
    email: user.email!,
  });

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expires: expiresAt,
    },
  });

  return { accessToken, refreshToken };
};

/**
 * Initialize balances for a new user
 */
const initializeUserBalances = async (userId: string): Promise<void> => {
  // Create a default fiat balance (USD)
  await prisma.fiatBalance.create({
    data: {
      userId,
      currency: "USD",
      balance: 0,
    },
  });

  await prisma.fiatBalance.create({
    data: {
      userId,
      currency: "AED",
      balance: 0,
    },
  });

  // Create default crypto balances

  for (const crypto of Object.values(CryptoType)) {
    await prisma.cryptoBalance.create({
      data: {
        userId,
        cryptoType: crypto as CryptoType,
        balance: 0,
      },
    });
  }
};

export const resendVerification = async (email: string): Promise<void> => {
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if the email exists or not
    return;
  }

  // Delete old verification tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { email },
  });

  // Generate new verification token
  const verificationToken = generateVerificationToken(email);

  // Save verification token
  await prisma.verificationToken.create({
    data: verificationToken,
  });

  // Send verification email
  await emailService.sendVerificationEmail(email, verificationToken.token);
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
  data: RefreshTokenInput
): Promise<{ accessToken: string; refreshToken: string }> => {
  const { refreshToken } = data;

  // Verify the refresh token
  try {
    const payload = await jwtVerify(refreshToken);

    // Check if token is a refresh token
    if (payload.type !== "refresh") {
      throw new AuthenticationError("Invalid refresh token");
    }

    // Find the refresh token in the database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: payload.userId,
      },
    });

    if (!storedToken) {
      throw new AuthenticationError("Invalid refresh token");
    }

    // Check if token is expired
    if (new Date() > storedToken.expires) {
      // Delete the expired token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      throw new AuthenticationError("Refresh token expired");
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Delete the old refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // Generate new tokens
    const newTokens = await generateTokenPair({
      userId: user.id,
      email: user.email!,
    });

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await prisma.refreshToken.create({
      data: {
        token: newTokens.refreshToken,
        userId: user.id,
        expires: expiresAt,
      },
    });

    return newTokens;
  } catch (error) {
    throw new AuthenticationError("Invalid refresh token");
  }
};

/**
 * Invalidate a refresh token
 */
export const invalidateRefreshToken = async (
  refreshToken: string
): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: {
      token: refreshToken,
    },
  });
};

/**
 * Send login verification code
 */
export const sendLoginVerificationCode = async (
  email: string
): Promise<void> => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // If user doesn't exist, return silently (security best practice)
  if (!user) {
    console.log(`Login verification requested for non-existent user: ${email}`);
    return;
  }

  // Generate login verification token
  const loginToken = generateTwoFactorToken(email, 10); // 10 minutes expiry

  // Save the token
  await prisma.twoFactorToken.create({
    data: {
      email,
      token: loginToken.token,
      expires: loginToken.expires,
    },
  });

  // Send the verification code via email
  try {
    await emailService.sendLoginVerificationEmail(email, loginToken.token);
    console.log(`Login verification code sent to: ${email}`);
  } catch (error) {
    console.error("Failed to send login verification code:", error);
    // We're catching the error but not rethrowing to prevent revealing if the email exists
  }
};

/**
 * Verify login code
 */
export const verifyLoginCode = async (
  data: VerifyLoginCodeInput
): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
  const { email, code } = data;

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AuthenticationError("Invalid verification credentials");
  }

  // Find the token
  const twoFactorToken = await prisma.twoFactorToken.findFirst({
    where: {
      email,
      token: code,
      expires: {
        gt: new Date(),
      },
    },
  });

  if (!twoFactorToken) {
    throw new AuthenticationError("Invalid or expired verification code");
  }

  // Delete the token (one-time use)
  await prisma.twoFactorToken.delete({
    where: {
      id: twoFactorToken.id,
    },
  });

  // Generate JWT tokens
  const { accessToken, refreshToken } = await generateTokenPair({
    userId: user.id,
    email: user.email!,
  });

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expires: expiresAt,
    },
  });

  return { user, accessToken, refreshToken };
};
