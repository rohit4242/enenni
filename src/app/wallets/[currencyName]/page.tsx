"use client";

import { useEffect, Suspense } from "react";
import { BalanceCard } from "@/components/BalanceCard";
import { WalletsDataTable } from "../components/data-table";
import { WalletsList } from "../components/wallets-list";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CryptoType } from "@prisma/client";
import { use } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { useMounted } from "@/hooks/use-mounted";

export default function WalletPage({
  params,
}: {
  params: Promise<{ currencyName: string }> & { currencyName: string };
}) {
  const mounted = useMounted();
  const router = useRouter();
  const resolvedParams = use(params);
  const currencyName = resolvedParams.currencyName;
  const user = useCurrentUser();
  const { transactions, isLoading, balance, error } = useTransactions(
    currencyName.toUpperCase() as CryptoType
  );

  useEffect(() => {
    if (!user?.id && mounted) {
      router.push("/auth/login");
    }
  }, [user?.id, router, mounted]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-white">
          {currencyName.toUpperCase()} Wallet
        </h2>
        <p className="text-teal-100">
          Manage your {currencyName.toUpperCase()} transactions
        </p>
      </div>

      <div className="py-4">
        <WalletsList />
      </div>

      <Suspense fallback={"Loading..."}>
        <div className="md:pt-10">
          <BalanceCard
            currency={currencyName.toUpperCase()}
            balance={balance?.toString()}
            isLoading={isLoading}
            type="crypto"
          />
        </div>
      </Suspense>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        <Suspense fallback={"Loading..."}>
          {isLoading ? (
            <div className="flex h-[200px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : transactions ? (
            <WalletsDataTable transactions={transactions} />
          ) : (
            <Alert>
              <AlertTitle>No Transactions</AlertTitle>
              <AlertDescription>
                No transactions found for this wallet.
              </AlertDescription>
            </Alert>
          )}
        </Suspense>
      </div>
    </div>
  );
}
