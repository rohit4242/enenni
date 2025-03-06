import { z } from "zod";
export type TransactionType = "FIAT_DEPOSIT" | "FIAT_WITHDRAWAL" | "CRYPTO_DEPOSIT" | "CRYPTO_WITHDRAWAL";

export const transactionSchema = z.discriminatedUnion("transactionType", [
  // Fiat Deposit
  z.object({
    transactionType: z.literal("FIAT_DEPOSIT"),
    amount: z.string().min(1, "Amount is required"),
    bankAccountId: z.string().min(1, "Bank account is required"),
    currency: z.enum(["USD", "AED"]),
    description: z.string().optional(),
  }),
  // Fiat Withdrawal
  z.object({
    transactionType: z.literal("FIAT_WITHDRAWAL"),
    amount: z.string().min(1, "Amount is required"),
    bankAccountId: z.string().min(1, "Bank account is required"),
    currency: z.enum(["USD", "AED"]),
    description: z.string().optional(),
  }),
  // Crypto Deposit
  z.object({
    transactionType: z.literal("CRYPTO_DEPOSIT"),
    amount: z.string().min(1, "Amount is required"),
    walletAddress: z.string().min(1, "Wallet address is required"),
    cryptoType: z.enum(["BTC", "ETH", "USDT", "USDC"]),
    network: z.string().min(1, "Network is required"),
    description: z.string().optional(),
  }),
  // Crypto Withdrawal
  z.object({
    transactionType: z.literal("CRYPTO_WITHDRAWAL"),
    amount: z.string().min(1, "Amount is required"),
    destinationAddress: z.string().min(1, "Destination address is required"),
    cryptoType: z.enum(["BTC", "ETH", "USDT", "USDC"]),
    network: z.string().min(1, "Network is required"),
    memo: z.string().optional(),
  }),
]);

export type TransactionFormValues = z.infer<typeof transactionSchema>;

