"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import CurrencyCard from "@/components/CurrencyCard"
import { Skeleton } from "@/components/ui/skeleton"

interface Balance {
  id: string
  currency: string
  balance: string
}

export function BankAccountsSidebar() {
  const params = useParams()
  const currentCurrency = params.currencyName as string
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(true)



  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setLoading(true)  
        const response = await fetch('/api/bank-accounts')
        const data = await response.json()
        setBalances(data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch balances:', error)
      }

    }

    fetchBalances()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((index) => (
          <Skeleton key={index} className="h-[76px] w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (balances.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        No balances found
      </div>
    )
  }


  return (
    <div className="space-y-4">
      {balances.map((balance) => (
        <CurrencyCard
          key={balance.id}
          type={balance.currency as "USDC" | "BTC" | "ETH" | "USDT" | "AED"}
          balance={balance.balance.toString()}
          isActive={currentCurrency === balance.currency.toLowerCase()}
          variant="bank-account"
        />
      ))}
    </div>
  )

} 