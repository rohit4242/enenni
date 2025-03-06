"use client";

import React, { useState } from "react";
import { ArrowUpRight, MoveDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { CryptoType } from "@/lib/types/db";
import { useToast } from "@/hooks/use-toast";
import { WalletSkeleton } from "./wallets-skeleton";
import { getCryptoBalanceByCryptoType } from "@/lib/api/crypto-balances";
import { CryptoDepositModal } from "@/components/modals/transaction/CryptoDepositModal";
import { CryptoWithdrawalModal } from "@/components/modals/transaction/CryptoWithdrawalModal";

// Define available networks for crypto types.
const CRYPTO_NETWORKS: Record<string, string[]> = {
  BTC: ["Bitcoin"],
  ETH: ["ERC20"],
  USDT: ["ERC20", "TRC20"],
  USDC: ["ERC20", "SOL"],
};

interface WalletBalanceCardProps {
  currency: CryptoType;
  onSuccess?: () => void;
}

export function WalletBalanceCard({ currency, onSuccess }: WalletBalanceCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Local state to control modal visibility.
  const [isDepositOpen, setDepositOpen] = useState(false);
  const [isWithdrawalOpen, setWithdrawalOpen] = useState(false);

  // Fetch crypto wallet balance.
  const { data: walletData, isLoading } = useQuery({
    queryKey: ["wallet", "crypto", currency],
    queryFn: async () => {
      const balance = await getCryptoBalanceByCryptoType(currency);
      return balance.data;
    },
    staleTime: 30000,
    retry: 1,
  });

  // Retrieve supported networks; fallback to an empty array.
  const networks = CRYPTO_NETWORKS[currency] ?? [];

  const handleDeposit = () => {
    if (!currency) {
      toast({
        title: "Error",
        description: "Currency is required",
        variant: "destructive",
      });
      return;
    }
    setDepositOpen(true);
  };

  const handleWithdrawal = () => {
    if (!currency) {
      toast({
        title: "Error",
        description: "Currency is required",
        variant: "destructive",
      });
      return;
    }
    if (!walletData?.balance || walletData.balance <= 0) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to withdraw",
        variant: "destructive",
      });
      return;
    }
    setWithdrawalOpen(true);
  };

  if (isLoading) {
    return <WalletSkeleton />;
  }

  return (
    <Card className="bg-card">
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Crypto Balance</p>
          <h2 className="text-3xl font-bold tracking-tight">
            {formatCurrency(walletData?.balance || 0, currency)}
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button onClick={handleDeposit} className="gap-2" variant="default">
            <ArrowUpRight className="h-4 w-4" />
            Deposit
          </Button>
          <Button
            onClick={handleWithdrawal}
            className="gap-2"
            variant="outline"
            disabled={!walletData?.balance || walletData.balance <= 0}
          >
            <MoveDown className="h-4 w-4" />
            Withdraw
          </Button>
        </div>
      </CardContent>
      <CryptoDepositModal
        isOpen={isDepositOpen}
        onClose={() => setDepositOpen(false)}
        cryptoType={currency}
        networks={networks}
        onSuccess={() => {
          onSuccess?.();
          queryClient.invalidateQueries({ queryKey: ["wallet", "crypto", currency] });
        }}
      />
      <CryptoWithdrawalModal
        isOpen={isWithdrawalOpen}
        onClose={() => setWithdrawalOpen(false)}
        cryptoType={currency}
        networks={networks}
        currentBalance={walletData?.balance || 0}
        onSuccess={() => {
          onSuccess?.();
          queryClient.invalidateQueries({ queryKey: ["wallet", "crypto", currency] });
        }}
      />
    </Card>
  );
}

export default WalletBalanceCard;
