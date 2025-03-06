import * as z from "zod";

export const newBankAccountSchema = z
  .object({
    accountHolderName: z.string().nonempty("Account holder name is required"),
    accountType: z.enum(["IBAN", "ACCOUNT_NUMBER"]),
    bankName: z.string().nonempty("Bank name is required"),
    bankAddress: z.string().nonempty("Bank address is required"),
    bankCountry: z.string().nonempty("Bank country is required"),
    accountCurrency: z.enum(["USD", "AED"]),
    proofDocumentUrl: z.string().url("Invalid URL format").optional(),
  })
  .and(
    z.discriminatedUnion("accountType", [
      z.object({
        accountType: z.literal("IBAN"),
        iban: z.string().min(5, "Valid IBAN is required"),
        verifyIban: z.string().min(5, "Valid IBAN is required"),
        accountNumber: z.string().optional(),
        verifyAccountNumber: z.string().optional(),
      }),
      z.object({
        accountType: z.literal("ACCOUNT_NUMBER"),
        accountNumber: z.string().min(5, "Valid account number is required"),
        verifyAccountNumber: z
          .string()
          .min(5, "Valid account number is required"),
        iban: z.string().optional(),
        verifyIban: z.string().optional(),
      }),
    ])
  )
  .refine(
    (data) => {
      if (data.accountType === "IBAN") {
        return data.iban === data.verifyIban;
      } else {
        return data.accountNumber === data.verifyAccountNumber;
      }
    },
    {
      message: "Verification fields do not match",
      path: ["verifyIban", "verifyAccountNumber"],
    }
  );

export type NewBankAccountFormValues = z.infer<typeof newBankAccountSchema>;
