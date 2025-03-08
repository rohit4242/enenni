import { z } from 'zod';
import { TransactionStatus, CurrencyType } from '@prisma/client';

// Schema for creating a new external bank account
export const createExternalBankAccountSchema = z.object({
  // Common fields
  accountHolderName: z.string().nonempty("Account holder name is required"),
  bankName: z.string().nonempty("Bank name is required"),
  bankAddress: z.string().nonempty("Bank address is required"),
  bankCountry: z.string().nonempty("Bank country is required"),
  accountCurrency: z.nativeEnum(CurrencyType),
  proofDocumentUrl: z.string().url("Invalid URL format").optional(),
})
.and(
  // Either IBAN or accountNumber must be provided
  z.union([
    z.object({
      iban: z.string().min(5, "Valid IBAN is required"),
      accountNumber: z.string().optional(),
    }),
    z.object({
      accountNumber: z.string().min(5, "Valid account number is required"),
      iban: z.string().optional(),
    })
  ])
)
.refine(data => data.iban || data.accountNumber, {
  message: "Either IBAN or account number must be provided",
  path: ["accountNumber"]
});

// Schema for updating an existing external bank account
export const updateExternalBankAccountSchema = z.object({
  bankName: z.string().min(2).optional(),
  accountHolder: z.string().min(2).optional(),
  accountNumber: z.string().min(5).optional(),
  iban: z.string().min(5).optional(),
  currency: z.nativeEnum(CurrencyType).optional(),
  bankAddress: z.string().optional(),
  bankCountry: z.string().optional(),
  proofDocumentUrl: z.string().url().optional(),
});

// Schema for admin verification of an external bank account
export const verifyExternalBankAccountSchema = z.object({
  status: z.nativeEnum(TransactionStatus, {
    message: 'Valid status is required'
  }),
  verifyIban: z.string().optional(),
  verifyAccountNumber: z.string().optional(),
});

// Schema for filtering external bank accounts
export const filterExternalBankAccountSchema = z.object({
  status: z.nativeEnum(TransactionStatus).optional(),
  currency: z.nativeEnum(CurrencyType).optional(),
});

// Schema for updating proof document URL
export const updateProofDocumentSchema = z.object({
  proofDocumentUrl: z.string().url("Valid proof document URL is required"),
}); 