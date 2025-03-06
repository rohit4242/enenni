import prisma from '../lib/prisma';
import { NotFoundError, ValidationError } from '../errors/AppError';
import type { 
  CreateFiatDepositInput,
  CreateFiatWithdrawalInput,
  CreateCryptoDepositInput,
  CreateCryptoWithdrawalInput,
  BuyCryptoInput,
  SellCryptoInput,
  TransactionFilterInput
} from "../schemas/transaction.schema";
import { type Transaction, CryptoType, CurrencyType } from "@prisma/client";

/**
 * Create a fiat deposit transaction
 */
export const createFiatDeposit = async (
  userId: string, 
  data: CreateFiatDepositInput
): Promise<Transaction> => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check if user has a fiat balance for this currency
  let fiatBalance = await prisma.fiatBalance.findUnique({
    where: {
      userId_currency: {
        userId,
        currency: data.currency,
      },
    },
  });

  // If not, create one
  if (!fiatBalance) {
    fiatBalance = await prisma.fiatBalance.create({
      data: {
        userId,
        currency: data.currency,
        balance: 0,
      },
    });
  }

  // Create the transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: 'FIAT_DEPOSIT',
      status: 'PENDING',
      fiatAmount: data.amount,
      fiatCurrency: data.currency,
      fiatBalanceId: fiatBalance.id,
      referenceId: data.referenceId,
      description: data.description,
    },
  });

  return transaction;
};

/**
 * Get transactions for a user with optional filtering
 */
export const getTransactions = async (
  userId: string,
  filters: TransactionFilterInput
): Promise<{ transactions: Transaction[]; total: number }> => {
  const { type, startDate, endDate, page, limit } = filters;
  
  // Build where clause
  const where: any = { userId };
  
  if (type) {
    where.type = type;
  }
  
  if (startDate) {
    where.createdAt = {
      ...(where.createdAt || {}),
      gte: startDate,
    };
  }
  
  if (endDate) {
    where.createdAt = {
      ...(where.createdAt || {}),
      lte: endDate,
    };
  }
  
  // Get total count for pagination
  const total = await prisma.transaction.count({ where });
  
  // Get paginated transactions
  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });
  
  return { transactions, total };
};

/**
 * Get transactions filtered by crypto type
 */
export const getTransactionsByCryptoType = async (
  userId: string,
  cryptoType: string,
  page = 1,
  limit = 10
): Promise<{ transactions: Transaction[]; total: number }> => {
  // Validate crypto type
  if (!Object.values(CryptoType).includes(cryptoType as any)) {
    throw new ValidationError(`Invalid crypto type: ${cryptoType}`);
  }
  
  // Build where clause
  const where = {
    userId,
    cryptoType: cryptoType as CryptoType,
  };
  
  // Get total count for pagination
  const total = await prisma.transaction.count({ where });
  
  // Get paginated transactions
  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });
  
  return { transactions, total };
};

/**
 * Get transactions filtered by currency
 */
export const getTransactionsByCurrency = async (
  userId: string,
  currency: string,
  page = 1,
  limit = 10
): Promise<{ transactions: Transaction[]; total: number }> => {
  // Validate currency
  if (!Object.values(CurrencyType).includes(currency as any)) {
    throw new ValidationError(`Invalid currency: ${currency}`);
  }
  
  // Build where clause
  const where = {
    userId,
    fiatCurrency: currency as CurrencyType,
  };
  
  // Get total count for pagination
  const total = await prisma.transaction.count({ where });
  
  // Get paginated transactions
  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });
  
  return { transactions, total };
}; 