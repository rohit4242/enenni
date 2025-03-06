import { z } from 'zod';
import { CurrencyType, TransactionType } from '@prisma/client';

// Schema for creating a new fiat balance
export const createFiatBalanceSchema = z.object({
  userId: z.string().nonempty("User ID is required"),
  currency: z.nativeEnum(CurrencyType, {
    message: 'Valid currency is required'
  }),
  balance: z.number().default(0),
});

export const createFiatBalanceTransactionSchema = z.object({
  userId: z.string().nonempty("User ID is required"),
  currency: z.nativeEnum(CurrencyType, {
    message: 'Valid currency is required'
  }),
  transactionType: z.nativeEnum(TransactionType, {
    message: 'Valid transaction type is required'
  }),
  accountId: z.string().nonempty("Account ID is required"),
  amount: z.number().default(0),
  description: z.string().optional(),
});

// Schema for updating an existing fiat balance
export const updateFiatBalanceSchema = z.object({
  balance: z.number().optional(),
  currency: z.nativeEnum(CurrencyType).optional(),
});

// Schema for adding or subtracting from balance
export const adjustBalanceSchema = z.object({
  amount: z.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number"
  }),
  description: z.string().optional(),
});

// Schema for transferring between balances
export const transferBalanceSchema = z.object({
  fromCurrency: z.nativeEnum(CurrencyType, {
    message: 'Valid source currency is required'
  }),
  toCurrency: z.nativeEnum(CurrencyType, {
    message: 'Valid destination currency is required'
  }),
  amount: z.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number"
  }).positive("Amount must be positive"),
  description: z.string().optional(),
});

// Schema for filtering fiat balances
export const filterFiatBalanceSchema = z.object({
  currency: z.nativeEnum(CurrencyType).optional(),
  minBalance: z.number().optional(),
  maxBalance: z.number().optional(),
}); 