import { useQuery } from "@tanstack/react-query"
import { BankAccount, Transaction } from "@/lib/types/bank-account"

export type BankAccountWithTransactions = BankAccount & {
  transactions: Transaction[]
}

export const useBankAccount = (currency: string) => {
  const {
    data: bankAccount,
    isLoading,
    error,
  } = useQuery<BankAccountWithTransactions>({
    queryKey: ["bankAccount", currency],
    queryFn: async () => {
      const response = await fetch(`/api/bank-accounts/${currency}`)
      if (!response.ok) {
        throw new Error("Failed to fetch bank account")
      }
      return response.json()
    },
  })

  return {
    bankAccount,
    isLoading,
    error: error as Error,
  }
} 