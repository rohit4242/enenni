import * as bcrypt from 'bcrypt';

/**
 * Hash a password
 * @param password - The plain text password to hash
 * @returns The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verify a password against a hash
 * @param password - The plain text password to verify
 * @param hash - The hash to verify against
 * @returns True if the password matches the hash, false otherwise
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
}; 