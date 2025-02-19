"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getFiatBalances } from "@/lib/actions/balance";
import CurrencyCard from "@/components/CurrencyCard";
import { BalanceSkeleton } from "./balance-skeleton";

export function BalanceList() {
  const params = useParams();
  const currentCurrency = params.currencyName as string;

  const { data: balances, isLoading } = useQuery({
    queryKey: ["fiat-balances"],
    queryFn: async () => {
      const balances = await getFiatBalances();
      return balances;
    },
    staleTime: 30000,
  });


  if (isLoading) {
    return <BalanceSkeleton />;
  }

  if (!balances?.length) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        No balances found
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 justify-start items-center">
        {balances.map((balance) => (
          <div key={balance.id} className="w-[150px] flex-shrink-0">
            <CurrencyCard
              type={balance.currency}
              isActive={currentCurrency === balance.currency.toLowerCase()}
              variant="balances"
            />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
} 