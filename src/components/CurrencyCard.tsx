"use client"

import { Bitcoin, ChevronRight, DollarSign, EclipseIcon as Ethereum } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CurrencyCardProps {
  type: "USDC" | "BTC" | "ETH" | "USDT" | "AED" | "USD" | "EUR" | "GBP"
  balance: string
  isActive?: boolean
  variant?: "wallet" | "bank-account"
}

export default function CurrencyCard({ 
  type, 
  balance, 
  isActive,
  variant = "wallet" 
}: CurrencyCardProps) {
  const router = useRouter()
  const getCurrencyIcon = () => {
    switch (type) {
      case "USDC":
        return <DollarSign className="size-6 text-blue-500" />
      case "BTC":
        return <Bitcoin className="size-6 text-orange-500" />
      case "ETH":
        return <Ethereum className="size-6 text-purple-500" />
      case "USDT":
        return (
          <div className="flex size-6 items-center justify-center rounded-full bg-teal-500 text-white">
            <span className="text-xs font-bold">₮</span>
          </div>
        )
      case "AED":
        return <DollarSign className="size-6 text-green-500" />
      case "USD":
        return <DollarSign className="size-6 text-emerald-500" />
      case "EUR":
        return (
          <div className="flex size-6 items-center justify-center rounded-full bg-blue-500 text-white">
            <span className="text-xs font-bold">€</span>
          </div>
        )
      case "GBP":
        return (
          <div className="flex size-6 items-center justify-center rounded-full bg-indigo-500 text-white">
            <span className="text-xs font-bold">£</span>
          </div>
        )
    }
  }

  const getCurrencyName = () => {
    switch (type) {
      case "USDC":
        return "Circle USD"
      case "BTC":
        return "Bitcoin"
      case "ETH":
        return "Ethereum"
      case "USDT":
        return "Tether"
      case "AED":
        return "UAE Dirham"
      case "USD":
        return "US Dollar"
      case "EUR":
        return "Euro"
      case "GBP":
        return "British Pound"
    }
  }

  const handleClick = () => {
    const basePath = variant === "wallet" ? "/wallets" : "/bank-accounts"
    router.push(`${basePath}/${type.toLowerCase()}`)
  }

  return (
    <Card
      className={cn("group relative cursor-pointer transition-colors hover:bg-accent", isActive && "bg-accent")}
      onClick={handleClick}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          {getCurrencyIcon()}
        </div>
        <div className="flex flex-1 flex-col">
          <span className="font-medium">{getCurrencyName()}</span>
          <span className="text-sm text-muted-foreground">
            Balance: {balance} {type}
          </span>
        </div>
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </CardContent>
    </Card>
  )
} 