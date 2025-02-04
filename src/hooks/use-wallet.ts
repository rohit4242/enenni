import { useEffect, useState } from "react"
import { Wallet, Transaction } from "@prisma/client"

 export interface WalletWithTransactions extends Wallet {
  transactions: Transaction[]
}



interface UseWalletReturn {
  wallet: WalletWithTransactions | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useWallet(currency: string): UseWalletReturn {
  const [wallet, setWallet] = useState<WalletWithTransactions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const validCurrencies = ["btc", "eth", "usdc", "usdt"]
  
  const fetchWallet = async () => {
    try {
      if (!validCurrencies.includes(currency.toLowerCase())) {
        setError(`Invalid wallet type: ${currency.toUpperCase()}`)
        return
      }

      setLoading(true)
      setError(null) 
      
      const response = await fetch(`/api/wallets/${currency.toLowerCase()}`)
      
      const data = await response.json()
      setWallet(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch wallet")
      console.error("Error fetching wallet:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWallet()
  }, [currency])

  const refetch = async () => {
    await fetchWallet()
  }

  return {
    wallet,
    loading,
    error,
    refetch
  }
} 