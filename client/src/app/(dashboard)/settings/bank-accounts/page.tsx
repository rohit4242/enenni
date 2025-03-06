"use client";

import { useNewBankAccountModal } from "@/hooks/use-new-bank-account";
import { BankAccountsDataTable } from "./components/data-table";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { getBankAccounts } from "@/lib/api/external-bank-accounts";

export default function BankAccountsPage() {
  const { onOpen } = useNewBankAccountModal();

  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const data = await getBankAccounts();
      return data.accounts;
    },
  });

  if (error) {
    return (
      <PageLayout
        heading="External Bank Accounts"
        subheading="Manage your connected bank accounts"
      >
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load bank accounts. Please try again later.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      heading="External Bank Accounts"
      subheading="Manage your connected bank accounts"
      actions={
        <Button
          variant="outline"
          onClick={onOpen}
          className="text-primary hover:text-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Account
        </Button>
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <Card className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
              <div className="pt-4">
                <Skeleton className="h-[400px] w-full" />
              </div>
            </div>
          </Card>
        ) : accounts?.length === 0 ? (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No Bank Accounts</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven&apos;t added any bank accounts yet. Add one to get started.
              </p>
              <Button onClick={onOpen} className="mt-4" variant="outline">
                Add Bank Account
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="rounded-md">
              <BankAccountsDataTable accounts={accounts} />
            </div>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
