"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import CurrencyCard from "@/components/CurrencyCard";
import { WalletSkeleton } from "./wallets-skeleton";
import { getCryptoWallets } from "@/lib/api/crypto-wallets";
import { CryptoBalance } from "@/lib/types/db";

export function WalletsList() {
  const params = useParams();
  const currentCurrency = params.currencyName as string;

  const { data: wallets, isLoading, error } = useQuery({
    queryKey: ["crypto-wallets"],
    queryFn: async () => {
      const data = await getCryptoWallets();
      return data.wallets;
    },
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
        {wallets.map((wallet: CryptoBalance) => (
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