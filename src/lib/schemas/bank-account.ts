import * as z from "zod";

export const newBankAccountSchema = z.object({
  accountHolder: z.string().min(2, "Account holder name is required"),
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().optional(),
  iban: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  bankAddress: z.string().min(2, "Bank address is required"),
  bankCountry: z.string().min(2, "Bank country is required"),
});

export type NewBankAccountFormValues = z.infer<typeof newBankAccountSchema>; 