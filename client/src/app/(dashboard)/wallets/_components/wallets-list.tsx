"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ScrollArea, ScrollBar } from "../../../../components/ui/scroll-area";
import { getCryptoBalances } from "../../../../lib/actions/balance";
import CurrencyCard from "../../../../components/CurrencyCard";
import { WalletSkeleton } from "./wallets-skeleton";

export function WalletsList() {
  const params = useParams();
  const currentCurrency = params.currencyName as string;

  const { data: wallets, isLoading } = useQuery({
    queryKey: ["crypto-balances"],
    queryFn: async () => {
      const wallets = await getCryptoBalances();
      return wallets;
    },
    staleTime: 30000,
  });


  if (isLoading) {
    return <WalletSkeleton />;
  }

  if (!wallets?.length) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        No wallets found
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 justify-start items-center">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="w-[150px] flex-shrink-0">
            <CurrencyCard
              type={wallet.cryptoType}
              isActive={currentCurrency === wallet.cryptoType.toLowerCase()}
              variant="wallet"
            />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
} 