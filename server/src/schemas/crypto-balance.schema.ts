import { z } from "zod";
import { CryptoType, TransactionType } from "@prisma/client";

// Schema for creating a new crypto balance
export const createCryptoBalanceSchema = z.object({
  userId: z.string().nonempty("User ID is required"),
  cryptoType: z.nativeEnum(CryptoType, {
    message: "Valid crypto type is required",
  }),
  balance: z.number().default(0),
  walletAddress: z.string().optional(),
});

export const createCryptoBalanceTransactionSchema = z.object({
  userId: z.string().nonempty("User ID is required"),
  cryptoType: z.nativeEnum(CryptoType, {
    message: "Valid crypto type is required",
  }),
  walletAddress: z.string().nonempty("Wallet address is required"),
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be positive"),
  transactionType: z.nativeEnum(TransactionType, {
    message: "Valid transaction type is required",
  }),
  network: z.string().nonempty("Network is required"),
  description: z.string().optional(),
});

// Schema for updating an existing crypto balance
export const updateCryptoBalanceSchema = z.object({
  balance: z.number().optional(),
  cryptoType: z.nativeEnum(CryptoType).optional(),
  walletAddress: z.string().optional(),
});

// Schema for adding or subtracting from balance
export const adjustBalanceSchema = z.object({
  amount: z.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  }),
  description: z.string().optional(),
});

// Schema for transferring between balances
export const transferBalanceSchema = z.object({
  fromCryptoType: z.nativeEnum(CryptoType, {
    message: "Valid source crypto type is required",
  }),
  toCryptoType: z.nativeEnum(CryptoType, {
    message: "Valid destination crypto type is required",
  }),
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be positive"),
  description: z.string().optional(),
});

// Schema for filtering crypto balances
export const filterCryptoBalanceSchema = z.object({
  cryptoType: z.nativeEnum(CryptoType).optional(),
  minBalance: z.number().optional(),
  maxBalance: z.number().optional(),
  hasWalletAddress: z.boolean().optional(),
});
