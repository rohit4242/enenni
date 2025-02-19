import { z } from "zod";
import { CurrencyType, CryptoType, TransactionType } from "@prisma/client";

export const transactionSchema = z.discriminatedUnion("transactionType", [
  // Fiat Deposit
  z.object({
    transactionType: z.literal(TransactionType.FIAT_DEPOSIT),
    amount: z.string().min(1, "Amount is required"),
    bankAccountId: z.string().min(1, "Bank account is required"),
    currency: z.nativeEnum(CurrencyType),
    description: z.string().optional(),
  }),
  // Fiat Withdrawal
  z.object({
    transactionType: z.literal(TransactionType.FIAT_WITHDRAWAL),
    amount: z.string().min(1, "Amount is required"),
    bankAccountId: z.string().min(1, "Bank account is required"),
    currency: z.nativeEnum(CurrencyType),
    description: z.string().optional(),
  }),
  // Crypto Deposit
  z.object({
    transactionType: z.literal(TransactionType.CRYPTO_DEPOSIT),
    amount: z.string().min(1, "Amount is required"),
    walletAddress: z.string().min(1, "Wallet address is required"),
    cryptoType: z.nativeEnum(CryptoType),
    network: z.string().min(1, "Network is required"),
    description: z.string().optional(),
  }),
  // Crypto Withdrawal
  z.object({
    transactionType: z.literal(TransactionType.CRYPTO_WITHDRAWAL),
    amount: z.string().min(1, "Amount is required"),
    destinationAddress: z.string().min(1, "Destination address is required"),
    cryptoType: z.nativeEnum(CryptoType),
    network: z.string().min(1, "Network is required"),
    memo: z.string().optional(),
  }),
]);

export type TransactionFormValues = z.infer<typeof transactionSchema>;