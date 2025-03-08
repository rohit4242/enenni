"use client";

import React, { useState } from "react";
import { ArrowUpRight, MoveDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BalanceSkeleton } from "./loading-skeleton";
import { formatCurrency } from "@/lib/utils";
import { CurrencyType } from "@/lib/types/db";
import { useToast } from "@/hooks/use-toast";

import { FiatDepositModal } from "@/components/modals/transaction/FiatDepositModal";
import { FiatWithdrawalModal } from "@/components/modals/transaction/FiatWithdrawalModal";
import { getFiatBalanceByCurrency } from "@/lib/api/fiat-balances";
import { getBankAccounts } from "@/lib/api/external-bank-accounts";

interface BalanceCardProps {
  currency: CurrencyType;
  onSuccess?: () => void;
}

export function BalanceCard({ currency, onSuccess }: BalanceCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Local state controls for deposit and withdrawal modals.
  const [isDepositOpen, setDepositOpen] = useState(false);
  const [isWithdrawalOpen, setWithdrawalOpen] = useState(false);

  const { data: balanceData, isLoading: isBalanceLoading } = useQuery({
    queryKey: ["balance", "fiat", currency],
    queryFn: async () => {
      const balance = await getFiatBalanceByCurrency(currency);
      return balance.data;
    },
    staleTime: 30000,
    retry: 1,
  });

  const { data: bankAccounts, isLoading: isBankAccountsLoading, error: bankAccountsError } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const data = await getBankAccounts();
      return data.accounts;
    },
  });

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
    if (!balanceData?.balance || balanceData.balance <= 0) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to withdraw",
        variant: "destructive",
      });
      return;
    }
    setWithdrawalOpen(true);
  };

  if (isBalanceLoading) {
    return <BalanceSkeleton />;
  }

  return (
    <Card className="bg-card">
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <h2 className="text-3xl font-bold tracking-tight">
            {formatCurrency(balanceData?.balance || 0, currency)}
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={handleDeposit}
            className="gap-2"
            variant="default"
            disabled={isBalanceLoading}
          >
            <ArrowUpRight className="h-4 w-4" />
            Deposit
          </Button>
          <Button
            onClick={handleWithdrawal}
            className="gap-2"
            variant="outline"
            disabled={
              isBalanceLoading ||
              !balanceData?.balance ||
              balanceData.balance <= 0
            }
          >
            <MoveDown className="h-4 w-4" />
            Withdraw
          </Button>
        </div>
      </CardContent>
      {/* Render fiat modals */}
      <FiatDepositModal
        isOpen={isDepositOpen}
        onClose={() => setDepositOpen(false)}
        currency={currency}
        bankAccounts={bankAccounts ?? []}
        onSuccess={() => {
          onSuccess?.();
          queryClient.invalidateQueries({
            queryKey: ["balance", "fiat", currency],
          });
        }}
      />
      <FiatWithdrawalModal
        isOpen={isWithdrawalOpen}
        onClose={() => setWithdrawalOpen(false)}
        currency={currency}
        bankAccounts={bankAccounts ?? []}
        currentBalance={balanceData?.balance || 0}
        onSuccess={() => {
          onSuccess?.();
          queryClient.invalidateQueries({
            queryKey: ["balance", "fiat", currency],
          });
        }}
      />
    </Card>
  );
}

export default BalanceCard;
