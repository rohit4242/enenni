"use client";

import { BalanceCard } from "@/components/BalanceCard";
import { BalancesDataTable } from "../components/data-table";
import { useCallback } from "react";
import { use } from "react";

export default function BalanceCurrencyPage({
  params,
}: {
  params: Promise<{ currency: string }> & { currency: string };
}) {
  const resolvedParams = use(params);
  const currency = resolvedParams.currency;

  const handleDeposit = useCallback(() => {
    console.log(`Deposit ${currency}`);
  }, [currency]);

  const handleWithdraw = useCallback(() => {
    console.log(`Withdraw ${currency}`);
  }, [currency]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {currency.toUpperCase()} Balance
        </h2>
        <p className="text-muted-foreground">
          Manage your {currency.toUpperCase()} transactions
        </p>
      </div>
      <BalanceCard balance="0.95" currency={currency.toUpperCase()} />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        <BalancesDataTable currency={currency} />
      </div>
    </div>
  );
}
