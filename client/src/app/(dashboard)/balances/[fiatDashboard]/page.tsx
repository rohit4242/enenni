"use client";

import { Suspense, use, useEffect, useState } from "react";
import { currencySchema } from "@/lib/validations/balance";
import { BalanceList } from "@/app/(dashboard)/balances/_components/balance-list";
import { TransactionTable } from "@/app/(dashboard)/balances/_components/transaction-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { BalanceCard } from "@/app/(dashboard)/balances/_components/balance-card";
import { CurrencyType } from "@/lib/types/db";
import { BalanceLoadingSkeleton, TransactionTableLoadingSkeleton } from "@/app/(dashboard)/balances/_components/loading-skeleton";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface BalancePageProps {
  params: Promise<{ fiatDashboard: string }> & { fiatDashboard: string };
}

export default function BalancePage({ params }: BalancePageProps) {
  const { user } = useAuth();
  const resolvedParams = use(params);
  const fiatDashboard = resolvedParams.fiatDashboard.toUpperCase();
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

  if (!fiatDashboard) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Currency name is required.</AlertDescription>
      </Alert>
    );
  }

  try {
    currencySchema.parse(fiatDashboard);
  } catch {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Invalid Currency</AlertTitle>
        <AlertDescription>
          The currency {fiatDashboard} is not supported.
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
      <div className="space-y-4 mt-4">
        <h2 className="text-3xl font-semibold text-white">
          {fiatDashboard} Balance
        </h2>
        <p className="text-teal-100">
          Manage your {fiatDashboard} transactions
        </p>

        <Suspense fallback={<BalanceLoadingSkeleton />}>
          <BalanceList />
          <BalanceCard currency={fiatDashboard as CurrencyType} />
        </Suspense>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <Suspense fallback={<TransactionTableLoadingSkeleton />}>
          <TransactionTable currency={fiatDashboard as CurrencyType} />
        </Suspense>
      </div>

    </>
  );
}
