import type { Context, Next } from 'hono';
import prisma from '../lib/prisma';

/**
 * Middleware to check if the user has completed KYC
 */
export const requireKYC = async (c: Context, next: Next) => {
  const userId = c.get('userId');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycStatus: true },
  });

  if (!user || user.kycStatus !== 'APPROVED') {
    return c.json({
      status: 'error',
      message: 'KYC verification required',
      redirectTo: '/kyc'
    }, 403);
  }

  return next();
}; 