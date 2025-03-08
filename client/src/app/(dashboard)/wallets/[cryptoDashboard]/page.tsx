"use client";

import { Suspense, useEffect, useState } from "react";

import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CryptoType } from "@/lib/types/db";
import { use } from "react";

import { cryptoTypeSchema } from "@/lib/validations/wallets";
import { WalletSkeleton } from "@/app/(dashboard)/wallets/_components/wallets-skeleton";
import { WalletBalanceCard } from "@/app/(dashboard)/wallets/_components/wallet-balance-card";
import { WalletsList } from "@/app/(dashboard)/wallets/_components/wallets-list";
import { TransactionTable } from "@/app/(dashboard)/wallets/_components/transaction-table";
import { TransactionTableLoadingSkeleton } from "@/app/(dashboard)/balances/_components/loading-skeleton";
import { useAuth } from "@/context/AuthContext";

interface WalletPageProps {
  params: Promise<{ cryptoDashboard: CryptoType }> & { cryptoDashboard: CryptoType };
}

export default function WalletPage({ params }: WalletPageProps) {
  const { user } = useAuth();
  const resolvedParams = use(params);
  const cryptoDashboard = resolvedParams.cryptoDashboard.toUpperCase();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          You must be logged in to view this page.
        </AlertDescription>
      </Alert>
    );
  }

  if (!cryptoDashboard) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Currency name is required.</AlertDescription>
      </Alert>
    );
  }

  try {
    cryptoTypeSchema.parse(cryptoDashboard);
  } catch {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Invalid Currency</AlertTitle>
        <AlertDescription>
          The currency {cryptoDashboard} is not supported.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isMounted) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-12 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2 mt-4">
        <h2 className="text-3xl font-semibold text-white">
          {cryptoDashboard} Balance
        </h2>
        <p className="text-teal-100">
          Manage your {cryptoDashboard} transactions
        </p>

        <Suspense fallback={<WalletSkeleton />}>
          <WalletsList />
          <WalletBalanceCard currency={cryptoDashboard as CryptoType} />
        </Suspense>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <Suspense fallback={<TransactionTableLoadingSkeleton />}>
          <TransactionTable currency={cryptoDashboard as CryptoType} />
        </Suspense>
      </div>

    </>
  );
}
