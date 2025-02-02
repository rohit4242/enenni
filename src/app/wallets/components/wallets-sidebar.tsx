"use client"

import CurrencyCard from "@/components/CurrencyCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Wallet } from "@prisma/client"

export function WalletsSidebar() {
  const params = useParams()
  const currentWallet = params.currency as string
  const [wallets, setWallets] = useState<Wallet[]>([])

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await fetch('/api/wallets')
        const data = await response.json()
        setWallets(data)
      } catch (error) {
        console.error('Failed to fetch wallets:', error)
      }
    }

    fetchWallets()
  }, [])

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