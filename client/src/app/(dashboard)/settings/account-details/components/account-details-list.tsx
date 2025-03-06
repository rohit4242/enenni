"use client"

import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getEnenniBankAccounts } from "@/lib/api/enenni-bank-accounts"
import { PageLayout } from "@/components/PageLayout"

export function AccountDetailsList() {
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null)

  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ["enenni-bank-accounts"],
    queryFn: async () => {
      const data = await getEnenniBankAccounts();
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

  const toggleAccount = (id: string) => {
    setExpandedAccountId(prevId => (prevId === id ? null : id));
  }

  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />
  }

  if (!accounts || accounts.length === 0) {
    return (
      <Alert variant="default" className="mt-4">
        <AlertDescription>
          No bank accounts found. Please add an account to get started.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {accounts.map((account: any) => (
        <Card key={account.id} className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">
                {account.currency} account details
              </h3>
              <p className="text-sm text-muted-foreground">
                {account.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleAccount(account.id)}
            >
              {expandedAccountId === account.id ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {expandedAccountId === account.id && (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Account Name</p>
                  <p className="font-medium">{account.accountName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="font-medium">{account.accountNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IBAN</p>
                  <p className="font-medium">{account.iban}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bank Name</p>
                  <p className="font-medium">{account.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Swift Code</p>
                  <p className="font-medium">{account.swiftCode}</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
} 