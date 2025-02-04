"use client"

import CurrencyCard from "@/components/CurrencyCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Wallet } from "@prisma/client"
import { Skeleton } from "@/components/ui/skeleton"

export function WalletsSidebar() {
  const params = useParams()
  const currentWallet = params.currencyName as string
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/wallets')
        const data = await response.json()
        console.log(data)
        setWallets(data)
      } catch (error) {
        console.error('Failed to fetch wallets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWallets()
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

  if (wallets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        No wallets found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {wallets.map((wallet) => (
        <CurrencyCard
          key={wallet.id}
          type={wallet.currency as "USDC" | "BTC" | "ETH" | "USDT"}
          balance={wallet.balance.toString()}
          isActive={currentWallet === wallet.currency.toLowerCase()}
          variant="wallet"
        />
      ))}
    </div>
  )
} 