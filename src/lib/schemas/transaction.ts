import * as z from "zod"

export const transactionFormSchema = z.object({
  currency: z.string().min(1, "Please select a currency"),
  amount: z.string().min(1, "Amount is required"),
  fromAccount: z.string().min(1, "Please select an account"),
})

export type TransactionFormValues = z.infer<typeof transactionFormSchema> 