import { useEffect, useState } from "react"
import { CryptoBalance, Transaction } from "@prisma/client"

interface UseWalletReturn {
  walletAddress: string | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}


export function useCryptoWalletAddress(currency: string): UseWalletReturn {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)




  const validCurrencies = ["btc", "eth", "usdc", "usdt"]
  
  const fetchCryptoWallet = async () => {
    try {
      if (!validCurrencies.includes(currency.toLowerCase())) {
        setError(`Invalid wallet type: ${currency.toUpperCase()}`)

        return
      }

      setLoading(true)
      setError(null) 
      
      const response = await fetch(`/api/balances?type=${currency}&currency=${currency}`)
      

      const data = await response.json()
      setWalletAddress(data.walletAddress)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch wallet")
      console.error("Error fetching wallet:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCryptoWallet()
  }, [currency])

  const refetch = async () => {
    await fetchCryptoWallet()
  }

  return {
    walletAddress,
    loading,
    error,
    refetch
  }
} 