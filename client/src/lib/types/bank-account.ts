import { z } from "zod"
import { TransactionStatus, TransactionType } from "@/lib/types/db"

export const bankAccountSchema = z.object({
  id: z.string(),
  accountHolder: z.string(),
  bankName: z.string(),
  accountNumber: z.string().nullable(),
  iban: z.string().nullable(),
  proofDocumentUrl: z.string().nullable(),
  currency: z.string(),
  bankAddress: z.string().nullable(),
  bankCountry: z.string(),
  userId: z.string(),
  balance: z.number().or(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const transactionSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(TransactionType),
  amount: z.number().or(z.string()),
  currency: z.string(),
  status: z.nativeEnum(TransactionStatus),
  referenceId: z.string(),
  transactionHash: z.string().nullable(),
  description: z.string().nullable(),
  createdAt: z.date(),
  walletId: z.string().nullable(),
  bankAccountId: z.string().nullable(),
})

export type BankAccount = z.infer<typeof bankAccountSchema>
export type Transaction = z.infer<typeof transactionSchema>

// Helper types for API responses
export type BankAccountWithTransactions = BankAccount & {
  transactions: Transaction[]
}

// Helper types for forms and mutations
export type CreateBankAccountInput = Pick<
  BankAccount,
  | "accountHolder"
  | "bankName"
  | "accountNumber"
  | "iban"
  | "currency"
  | "bankAddress"
  | "bankCountry"
>

export type UpdateBankAccountInput = Partial<CreateBankAccountInput> 