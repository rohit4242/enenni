"use client";

import { BalancesDataTable } from "../components/data-table";
import { useCurrentUser } from "@/hooks/use-current-user";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BalanceCard } from "@/components/BalanceCard";
import { use } from "react";
import { useBankAccount } from "@/hooks/use-bank-account";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BalancePage({
  params,
}: {
  params: Promise<{ currencyName: string }> & { currencyName: string };
}) {
  const resolvedParams = use(params);
  const currencyName = resolvedParams.currencyName;
  const user = useCurrentUser();
  const { bankAccount, isLoading, error } = useBankAccount(currencyName);

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

  if (isLoading) {
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
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {currencyName.toUpperCase()} Balance
        </h2>
        <p className="text-muted-foreground">
          Manage your {currencyName.toUpperCase()} balance and

          transactions
        </p>
      </div>

      <BalanceCard
        balance={bankAccount?.balance?.toString() || "0"}
        currency={currencyName.toUpperCase()}
        isLoading={isLoading}
      />


      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        {bankAccount ? (
          <BalancesDataTable transactions={bankAccount.transactions} />
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
