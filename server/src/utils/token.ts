import crypto from 'crypto';

/**
 * Generate a random token
 * @param length - The length of the token to generate
 * @returns A random token
 */
export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a random verification token
 * @param email - The email to generate a token for
 * @param expiresInHours - The number of hours the token should be valid for
 * @returns An object containing the token and expiry date
 */
export const generateVerificationToken = (email: string, expiresInHours: number = 24) => {
  // Generate a 6-digit token
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  
  return {
    email,
    token,
    expires,
  };
};

/**
 * Generate a random password reset token
 * @param email - The email to generate a token for
 * @param expiresInHours - The number of hours the token should be valid for
 * @returns An object containing the token and expiry date
 */
export const generatePasswordResetToken = (email: string, expiresInHours: number = 1) => {
  const token = generateToken();
  const expires = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  
  return {
    email,
    token,
    expires,
  };
};

/**
 * Generate a random two-factor authentication token
 * @param email - The email to generate a token for
 * @param expiresInMinutes - The number of minutes the token should be valid for
 * @returns An object containing the token and expiry date
 */
export const generateTwoFactorToken = (email: string, expiresInMinutes: number = 10) => {
  // Generate a 6-digit token
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  
  return {
    email,
    token,
    expires,
  };
}; 