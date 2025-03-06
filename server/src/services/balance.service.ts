import type { CryptoType } from '@prisma/client';
import { NotFoundError } from '../errors/AppError';
import prisma from '../lib/prisma';

/**
 * Initialize balances for a new user
 */
export const initializeUserBalances = async (userId: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Create a default fiat balance (USD)
  await prisma.fiatBalance.createMany({
    data: [
      {
        userId,
        currency: 'USD',
        balance: 0,
      }
    ],
    skipDuplicates: true,
  });

  // Create default crypto balances
  const cryptoTypes = ['BTC', 'ETH', 'USDT'];
  
  await prisma.cryptoBalance.createMany({
    data: cryptoTypes.map(cryptoType => ({
      userId,
      cryptoType: cryptoType as CryptoType,
      balance: 0,
    })),
    skipDuplicates: true,
  });
};

/**
 * Get all balances for a user
 */
export const getUserBalances = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const fiatBalances = await prisma.fiatBalance.findMany({
    where: { userId },
  });

  const cryptoBalances = await prisma.cryptoBalance.findMany({
    where: { userId },
  });

  return {
    fiat: fiatBalances,
    crypto: cryptoBalances,
  };
}; 