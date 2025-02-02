"use client"
import { BalanceCard } from "@/components/BalanceCard"
import { WalletsDataTable } from "../components/data-table"
import { use } from "react"
// import { useWalletBalance } from "@/hooks/use-wallet-balance"

export default function WalletPage({ 
  params 
}: { 
  params: Promise<{ currency: string }> & { currency: string }
}) {
  const resolvedParams = use(params)
  const currency = resolvedParams.currency

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {currency.toUpperCase()} Wallet
        </h2>
        <p className="text-muted-foreground">
          Manage your {currency.toUpperCase()} transactions
        </p>
      </div>

      <BalanceCard
        currency={currency.toUpperCase()}
        balance="00"
      />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        <WalletsDataTable />
      </div>
    </div>
  )
} 