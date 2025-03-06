import { z } from 'zod';
import { TransactionStatus, CurrencyType } from '@prisma/client';

// Schema for creating a new enenni bank account
export const createEnenniBankAccountSchema = z.object({
  accountName: z.string().nonempty("Account name is required"),
  accountNumber: z.string().nonempty("Account number is required"),
  iban: z.string().nonempty("IBAN is required"),
  bankName: z.string().nonempty("Bank name is required"),
  currency: z.nativeEnum(CurrencyType, {
    message: 'Valid currency is required'
  }),
  swiftCode: z.string().nonempty("Swift code is required"),
  description: z.string().optional(),
});

// Schema for updating an existing enenni bank account
export const updateEnenniBankAccountSchema = z.object({
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  iban: z.string().optional(),
  bankName: z.string().optional(),
  currency: z.nativeEnum(CurrencyType).optional(),
  swiftCode: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Schema for admin verification of an enenni bank account
export const verifyEnenniBankAccountSchema = z.object({
  status: z.nativeEnum(TransactionStatus, {
    message: 'Valid status is required'
  }),
  remarks: z.string().optional(),
});

// Schema for filtering enenni bank accounts
export const filterEnenniBankAccountSchema = z.object({
  currency: z.nativeEnum(CurrencyType).optional(),
  isActive: z.boolean().optional(),
}); 