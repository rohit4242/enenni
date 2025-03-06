import { z } from 'zod';
import { CryptoType, CurrencyType } from '@prisma/client';

export const createBankAccountSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountHolder: z.string().min(1, 'Account holder name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  iban: z.string().min(1, 'IBAN is required'),
  currency: z.nativeEnum(CurrencyType, {
    errorMap: () => ({ message: 'Invalid currency' }),
  }),
  bankAddress: z.string().optional(),
  bankCountry: z.string().optional(),
  proofDocumentUrl: z.string().url('Invalid document URL').optional(),
});

export const updateBankAccountSchema = z.object({
  id: z.string().min(1, 'Bank account ID is required'),
  bankName: z.string().min(1, 'Bank name is required').optional(),
  accountHolder: z.string().min(1, 'Account holder name is required').optional(),
  accountNumber: z.string().min(1, 'Account number is required').optional(),
  iban: z.string().min(1, 'IBAN is required').optional(),
  currency: z.nativeEnum(CurrencyType, {
    errorMap: () => ({ message: 'Invalid currency' }),
  }).optional(),
  bankAddress: z.string().optional(),
  bankCountry: z.string().optional(),
  proofDocumentUrl: z.string().url('Invalid document URL').optional(),
});

export const createCryptoWalletSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  cryptoType: z.nativeEnum(CryptoType, {
    errorMap: () => ({ message: 'Invalid crypto type' }),
  }),
  nickname: z.string().optional(),
  type: z.string().optional(),
});

export const updateCryptoWalletSchema = z.object({
  id: z.string().min(1, 'Wallet ID is required'),
  walletAddress: z.string().min(1, 'Wallet address is required').optional(),
  cryptoType: z.nativeEnum(CryptoType, {
    errorMap: () => ({ message: 'Invalid crypto type' }),
  }).optional(),
  nickname: z.string().optional(),
  type: z.string().optional(),
});

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>;
export type CreateCryptoWalletInput = z.infer<typeof createCryptoWalletSchema>;
export type UpdateCryptoWalletInput = z.infer<typeof updateCryptoWalletSchema>; 