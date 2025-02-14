"use client"

import CurrencyCard from "@/components/CurrencyCard"
import { useParams } from "next/navigation"
import { CryptoBalance } from "@prisma/client"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { useMounted } from "@/hooks/use-mounted"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function WalletsList() {
  const mounted = useMounted()
  const params = useParams()
  const currentWallet = params.currencyName as string

  const { data: wallets, isLoading } = useQuery({
    queryKey: ["crypto-balances"],
    queryFn: async () => {
      const response = await fetch('/api/balances?type=crypto')
      if (!response.ok) throw new Error('Failed to fetch wallets')
      return response.json() as Promise<CryptoBalance[]>
    },
    enabled: mounted
  })

  if (!mounted || isLoading) {
    return (
      <div className="flex gap-4 pb-4">
        {[1, 2, 3, 4].map((index) => (
          <Skeleton key={index} className="h-[76px] w-[300px] flex-shrink-0 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!wallets || wallets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        No wallets found
      </div>
    )
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 justify-start items-center">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="w-[150px] flex-shrink-0">
            <CurrencyCard
              type={wallet.cryptoType as "USDC" | "BTC" | "ETH" | "USDT"}
              isActive={currentWallet === wallet.cryptoType.toLowerCase()}
              variant="wallet"
            />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
} 