"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import CurrencyCard from "@/components/CurrencyCard"

interface Balance {
  id: string
  currency: string
  balance: string
}

export function BalancesSidebar() {
  const params = useParams()
  const currentCurrency = params.currency as string
  const [balances, setBalances] = useState<Balance[]>([])

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await fetch('/api/balances')
        const data = await response.json()
        setBalances(data)
      } catch (error) {
        console.error('Failed to fetch balances:', error)
      }
    }

    fetchBalances()
  }, [])

  return (
    <div className="space-y-4">
      {balances.map((balance) => (
        <CurrencyCard
          key={balance.id}
          type={balance.currency as "USDC" | "BTC" | "ETH" | "USDT" | "AED"}
          balance={balance.balance.toString()}
          isActive={currentCurrency === balance.currency.toLowerCase()}
          variant="balance"
        />
      ))}
    </div>
  )
} 