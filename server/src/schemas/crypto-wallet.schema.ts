import { z } from "zod";
import { TransactionStatus, CryptoType } from "@prisma/client";

// Schema for creating a new crypto wallet
export const createCryptoWalletSchema = z.object({
  walletAddress: z
    .string()
    .min(10, "Wallet address must be at least 10 characters"),
  cryptoCurrency: z.nativeEnum(CryptoType, {
    message: "Invalid crypto type",
  }),
  nickname: z.string().min(2).optional(),
  walletType: z.string().optional(),
  chain: z.string().min(1, "Chain is required"),
});

// Schema for updating an existing crypto wallet
export const updateCryptoWalletSchema = z.object({
  walletAddress: z.string().min(10).optional(),
  nickname: z.string().min(2).optional(),
  walletType: z.string().optional(),
  chain: z.string().min(1, "Chain is required"),
  cryptoCurrency: z.nativeEnum(CryptoType, {
    message: "Invalid crypto type",
  }),
});

// Schema for admin verification of a crypto wallet
export const verifyCryptoWalletSchema = z.object({
  status: z.nativeEnum(TransactionStatus, {
    message: "Valid status is required",
  }),
  verifyWalletAddress: z.string().optional(),
});

// Schema for filtering crypto wallets
export const filterCryptoWalletSchema = z.object({
  status: z.nativeEnum(TransactionStatus).optional(),
  cryptoType: z.nativeEnum(CryptoType).optional(),
});
