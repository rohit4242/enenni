import * as z from "zod";

export const newWalletSchema = z.object({
  chain: z.string().min(1, "Chain is required"),
  address: z.string().min(1, "Wallet address is required"),
  nickname: z.string().optional(),
  type: z.enum(["First party", "Third party"]),
  currency: z.enum(["BTC", "ETH", "USDT", "USDC"]),
});

export type NewWalletFormValues = z.infer<typeof newWalletSchema>; 