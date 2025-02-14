"use client"

import CurrencyCard from "@/components/CurrencyCard"
import { useParams } from "next/navigation"
import { FiatBalance } from "@prisma/client"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { useMounted } from "@/hooks/use-mounted"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function BalancesList() {
  const mounted = useMounted()
  const params = useParams()
  const currentCurrency = params.currencyName as string

  const { data: balances, isLoading } = useQuery({
    queryKey: ["fiat-balances"],
    queryFn: async () => {
      const response = await fetch('/api/balances?type=fiat')
      if (!response.ok) throw new Error('Failed to fetch balances')
      return response.json() as Promise<FiatBalance[]>
    },
    enabled: mounted
  })

  if (!mounted || isLoading) {
    return (
      <div className="flex gap-4 pb-4">
        {[1, 2, 3, 4].map((index) => (
          <Skeleton key={index} className="h-[76px] w-[150px] flex-shrink-0 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!balances || balances.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        No balances found
      </div>
    )
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 justify-start items-center">
        {balances.map((balance) => (
          <div key={balance.id} className="w-[150px] flex-shrink-0">
            <CurrencyCard
              type={balance.currency as "USD" | "AED"}
              isActive={currentCurrency === balance.currency.toLowerCase()}
              variant="balances"
            />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
} 