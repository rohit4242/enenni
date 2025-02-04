import * as z from "zod"
import { TransactionType } from "@prisma/client"

export const depositSchema = z.object({
  currency: z.string().min(1, "Currency is required"),
  amount: z.string().min(1, "Amount is required"),
  fromWallet: z.string().min(1, "Wallet address is required"),
})

export const withdrawSchema = z.object({
  currency: z.string().min(1, "Currency is required"),
  amount: z.string().min(1, "Amount is required"),
  toWallet: z.string().min(1, "Wallet address is required"),
})

export type DepositFormValues = z.infer<typeof depositSchema>
export type WithdrawFormValues = z.infer<typeof withdrawSchema> 