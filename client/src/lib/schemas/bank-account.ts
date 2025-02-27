import * as z from "zod";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const newBankAccountSchema = z.object({
  accountHolderName: z.string().optional(),
  accountType: z.enum(["IBAN", "ACCOUNT_NUMBER"]),
  iban: z.string().optional(),
  verifyIban: z.string().optional(),
  accountNumber: z.string().optional(),
  verifyAccountNumber: z.string().optional(),
  bankAddress: z.string().optional(),

  bankCountry: z.string().optional(),
  proofDocumentUrl: z.string().optional(),
  currency: z.string().optional(),
  bankName: z.string().optional(),
  
}).refine((data) => {
  if (data.accountType === "IBAN") {
    return data.iban && data.verifyIban;
  }
  return data.accountNumber && data.verifyAccountNumber;
}, {
  message: "Please provide either IBAN or Account Number",
});

export type NewBankAccountFormValues = z.infer<typeof newBankAccountSchema>; 