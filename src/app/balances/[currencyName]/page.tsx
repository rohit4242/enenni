"use client";

import { BalancesDataTable } from "../components/data-table";
import { useCurrentUser } from "@/hooks/use-current-user";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BalanceCard } from "@/components/BalanceCard";
import { Suspense, use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFiatWallet } from "@/hooks/use-fiat-wallet";
import { CurrencyType } from "@prisma/client";
import { useTransactions } from "@/hooks/use-transactions";
import { BalancesList } from "../components/balances-list";

export default function BalancePage({
  params,
}: {
  params: Promise<{ currencyName: string }> & { currencyName: string };
}) {
  const resolvedParams = use(params);
  const currencyName = resolvedParams.currencyName.toUpperCase() as CurrencyType;
  const user = useCurrentUser();
  const { wallet, loading, error, refetch } = useFiatWallet(currencyName);
  const { transactions, isLoading: isLoadingTransactions } = useTransactions(currencyName);

  // Find the wallet that matches the currencyName
  const currentWallet = wallet?.find(w => w.currency === currencyName);

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

  if (loading || isLoadingTransactions) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Card className="bg-card/50">
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="rounded-md border">
              <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
              {[1, 2, 3, 4, 5].map((row) => (
                <div key={row} className="grid grid-cols-6 gap-4 p-4 border-t">
                  {[1, 2, 3, 4, 5, 6].map((cell) => (
                    <Skeleton key={cell} className="h-5 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-white">
          {currencyName} Balance
        </h2>
        <p className="text-teal-100">
          Manage your {currencyName} transactions
        </p>
      </div>

      <div className="py-4">
        <BalancesList />
      </div>

      <Suspense fallback={"Loading..."}>
        <div className="md:pt-10">
          <BalanceCard
            balance={currentWallet?.balance?.toString() || "0"}
            currency={currencyName}
            isLoading={loading}
            type="fiat"
            onSuccess={refetch}
          />
        </div>
      </Suspense>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        {transactions ? (
          <BalancesDataTable transactions={transactions} />
        ) : (
          <Alert>
            <AlertTitle>No Transactions</AlertTitle>
            <AlertDescription>
              No transactions found for this account.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
