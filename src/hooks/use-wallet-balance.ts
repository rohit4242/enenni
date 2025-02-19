import { useEffect, useState } from "react"
import { UserCryptoWallet } from "@prisma/client"

export function useWalletBalance(currency: string) {
  const [wallet, setWallet] = useState<UserCryptoWallet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await fetch(`/api/transactions/crypto/${currency}`)
        if (!response.ok) throw new Error("Failed to fetch wallet")
        const data = await response.json()
        setWallet(data)
      } catch (error) {
        console.error("Error fetching wallet:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWallet()
  }, [currency])

  return { wallet, loading }
} 