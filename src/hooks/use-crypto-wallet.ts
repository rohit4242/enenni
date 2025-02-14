import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CryptoBalance, Transaction } from "@prisma/client"

export interface CryptoBalanceWithTransactions extends CryptoBalance {
  transactions: Transaction[]
}

interface UseWalletReturn {
  wallet: CryptoBalanceWithTransactions[] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCryptoWallet(currency: string): UseWalletReturn {
  const queryClient = useQueryClient()
  const validCurrencies = ["btc", "eth", "usdc", "usdt"]

  const { data: wallet, isLoading: loading, error, refetch } = useQuery({
    queryKey: ["crypto-wallet", currency],
    queryFn: async () => {
      if (!validCurrencies.includes(currency.toLowerCase())) {
        throw new Error(`Invalid wallet type: ${currency.toUpperCase()}`)
      }

      const response = await fetch(`/api/balances?type=${currency}`)
      if (!response.ok) throw new Error("Failed to fetch wallet")
      return response.json() as Promise<CryptoBalanceWithTransactions[]>
    },
  })

  queryClient.invalidateQueries({
    queryKey: ["crypto-wallet", currency],
  })

  return {
    wallet: wallet || null,
    loading,
    error: error ? error.message : null,
    refetch: async () => {
      await refetch()
    }
  }
}