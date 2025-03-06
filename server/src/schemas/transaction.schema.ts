import { z } from 'zod';
import { CryptoType, CurrencyType, TransactionType } from '@prisma/client';

export const createFiatDepositSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.nativeEnum(CurrencyType, {
    errorMap: () => ({ message: 'Invalid currency' }),
  }),
  referenceId: z.string().optional(),
  description: z.string().optional(),
});

export const createFiatWithdrawalSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.nativeEnum(CurrencyType, {
    errorMap: () => ({ message: 'Invalid currency' }),
  }),
  bankAccountId: z.string().min(1, 'Bank account ID is required'),
  description: z.string().optional(),
});

export const createCryptoDepositSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  cryptoType: z.nativeEnum(CryptoType, {
    errorMap: () => ({ message: 'Invalid crypto type' }),
  }),
  walletId: z.string().min(1, 'Wallet ID is required'),
  transactionHash: z.string().optional(),
  description: z.string().optional(),
});

export const createCryptoWithdrawalSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  cryptoType: z.nativeEnum(CryptoType, {
    errorMap: () => ({ message: 'Invalid crypto type' }),
  }),
  walletAddress: z.string().min(1, 'Wallet address is required'),
  description: z.string().optional(),
});

export const buyCryptoSchema = z.object({
  fiatAmount: z.number().positive('Fiat amount must be positive'),
  fiatCurrency: z.nativeEnum(CurrencyType, {
    errorMap: () => ({ message: 'Invalid currency' }),
  }),
  cryptoType: z.nativeEnum(CryptoType, {
    errorMap: () => ({ message: 'Invalid crypto type' }),
  }),
  exchangeRate: z.number().positive('Exchange rate must be positive'),
});

export const sellCryptoSchema = z.object({
  cryptoAmount: z.number().positive('Crypto amount must be positive'),
  cryptoType: z.nativeEnum(CryptoType, {
    errorMap: () => ({ message: 'Invalid crypto type' }),
  }),
  fiatCurrency: z.nativeEnum(CurrencyType, {
    errorMap: () => ({ message: 'Invalid currency' }),
  }),
  exchangeRate: z.number().positive('Exchange rate must be positive'),
});

export const transactionFilterSchema = z.object({
  type: z.nativeEnum(TransactionType, {
    errorMap: () => ({ message: 'Invalid transaction type' }),
  }).optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
});

export type CreateFiatDepositInput = z.infer<typeof createFiatDepositSchema>;
export type CreateFiatWithdrawalInput = z.infer<typeof createFiatWithdrawalSchema>;
export type CreateCryptoDepositInput = z.infer<typeof createCryptoDepositSchema>;
export type CreateCryptoWithdrawalInput = z.infer<typeof createCryptoWithdrawalSchema>;
export type BuyCryptoInput = z.infer<typeof buyCryptoSchema>;
export type SellCryptoInput = z.infer<typeof sellCryptoSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>; 