"use client";

import { use } from "react";
import { BalanceCard } from "@/components/BalanceCard";
import { WalletsDataTable } from "../components/data-table";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useWallet, WalletWithTransactions } from "@/hooks/use-wallet";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletPage({
  params,
}: {
  params: Promise<{ currencyName: string }> & { currencyName: string };
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const currencyName = resolvedParams.currencyName;

  const user = useCurrentUser();
  const { wallet, loading, error, refetch } = useWallet(currencyName);

  const userId = user?.id;

  if (!userId) {
    router.push("/login");
    return null;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Wallet</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="link"
              className="pl-2 text-destructive"
              onClick={() => router.push("/wallets/btc")}
            >
              Go to BTC wallet
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle invalid currency types
  const validCurrencies = ["btc", "eth", "usdc", "usdt"];
  if (!validCurrencies.includes(currencyName.toLowerCase())) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Invalid Wallet</AlertTitle>
        <AlertDescription>
          The wallet type {currencyName.toUpperCase()} is not supported. Please
          select a valid wallet type.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {loading ? (
          <>
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
                    <div
                      key={row}
                      className="grid grid-cols-6 gap-4 p-4 border-t"
                    >
                      {[1, 2, 3, 4, 5, 6].map((cell) => (
                        <Skeleton key={cell} className="h-5 w-full" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {currencyName.toUpperCase()} Wallet
              </h2>
              <p className="text-muted-foreground">
                Manage your {currencyName.toUpperCase()} transactions
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <BalanceCard
              currency={currencyName.toUpperCase()}
              balance={wallet?.balance?.toString()}
              isLoading={loading}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Transaction History</h3>
              {loading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Loading transactions...
                    </p>
                  </div>
                </div>
              ) : wallet ? (
                <WalletsDataTable wallet={wallet as WalletWithTransactions} />
              ) : (
                <Alert>
                  <AlertTitle>No Transactions</AlertTitle>
                  <AlertDescription>
                    No transactions found for this wallet. Make a deposit to get
                    started.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
