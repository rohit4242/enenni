"use client";

import { Suspense } from "react";

import { useCurrentUser } from "@/hooks/use-current-user";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CryptoType } from "@prisma/client";
import { use } from "react";

import { cryptoTypeSchema } from "@/lib/validations/wallets";
import { ErrorBoundary } from "@/components/error-boundary";
import { WalletSkeleton } from "../_components/wallets-skeleton";
import { WalletBalanceCard } from "../_components/wallet-balance-card";
import { WalletsList } from "../_components/wallets-list";
import { TransactionTable } from "../_components/transaction-table";

interface WalletPageProps {
  params: Promise<{ currencyName: CryptoType }> & { currencyName: CryptoType };
}

export default function WalletPage({ params }: WalletPageProps) {
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
    cryptoTypeSchema.parse(currencyName);
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

        <Suspense fallback={<WalletSkeleton />}>
          <WalletsList />
          <WalletBalanceCard currency={currencyName as CryptoType} />
          <TransactionTable currency={currencyName as CryptoType} />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
