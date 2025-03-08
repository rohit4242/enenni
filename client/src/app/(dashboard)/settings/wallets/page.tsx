"use client";

import { WalletsDataTable } from "./components/data-table";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
import { useNewWalletModal } from "@/hooks/use-new-wallet-modal";
import { getCryptoWallets } from "@/lib/api/crypto-wallets";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletsPage() {
  const { onOpen } = useNewWalletModal();

  const { data: wallets, isLoading, error } = useQuery({
    queryKey: ["crypto-wallets"],
    queryFn: async () => {
      const data = await getCryptoWallets();
      return data.wallets;
    },
  });

  if (error) {
    return (
      <PageLayout
        heading="External Wallets"
        subheading="Manage your connected wallet addresses"
      >
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load wallets. Please try again later.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      heading="External Wallets"
      subheading="Manage your connected wallet addresses"
      actions={
        <Button
          variant="outline"
          onClick={onOpen}
          className="text-primary hover:text-primary"
        >
          Wallet +
        </Button>
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <Card className="p-4">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
            <div className="pt-4">
              <Skeleton className="h-[400px] w-full" />
            </div>
          </Card>
        ) : wallets?.length === 0 ? (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <AlertCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No Wallets</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven&apos;t added any wallets yet. Add one to get started.
              </p>
              <Button onClick={onOpen} className="mt-4" variant="outline">
                Add Wallet
              </Button>
            </div>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md p-4">
            <WalletsDataTable wallets={wallets} />
          </div>
        )}
      </div>
    </PageLayout>
  );
}