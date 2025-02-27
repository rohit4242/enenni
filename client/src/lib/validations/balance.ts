import { z } from "zod";
import { CurrencyType, CryptoType } from "@prisma/client";

export const balanceSchema = z.object({
  type: z.enum(["fiat", "crypto"]),
  currency: z.string().min(2).max(5),
});

export const currencySchema = z.nativeEnum(CurrencyType);
export const cryptoCurrencySchema = z.nativeEnum(CryptoType);

export type BalanceValidation = z.infer<typeof balanceSchema>; 
export type CurrencyValidation = z.infer<typeof currencySchema>; 
export type CryptoCurrencyValidation = z.infer<typeof cryptoCurrencySchema>; 
