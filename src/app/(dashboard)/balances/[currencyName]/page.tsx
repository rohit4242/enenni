"use client";

import { Suspense, use } from "react";
import { currencySchema } from "@/lib/validations/balance";
import { BalanceList } from "../_components/balance-list";
import { TransactionTable } from "../_components/transaction-table";
import { BalanceSkeleton } from "../_components/balance-skeleton";
import { ErrorBoundary } from "@/components/error-boundary";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { BalanceCard } from "../_components/balance-card";
import { CurrencyType } from "@prisma/client";

interface BalancePageProps {
  params: Promise<{ currencyName: string }> & { currencyName: string };
}

export default function BalancePage({ params }: BalancePageProps) {
  const user = useCurrentUser();
  const resolvedParams = use(params);
  const currencyName = resolvedParams.currencyName.toUpperCase();

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

  if (!currencyName) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Currency name is required.</AlertDescription>
      </Alert>
    );
  }

  try {
    currencySchema.parse(currencyName);
  } catch {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Invalid Currency</AlertTitle>
        <AlertDescription>
          The currency {currencyName} is not supported.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-10 mt-4">
        <div>
          <h2 className="text-3xl font-semibold text-white">
            {currencyName} Balance
          </h2>
          <p className="text-teal-100">
            Manage your {currencyName} transactions
          </p>
        </div>

        <Suspense fallback={<BalanceSkeleton />}>
          <BalanceList />
          <BalanceCard currency={currencyName as CurrencyType} />
          <TransactionTable currency={currencyName as CurrencyType} />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
