"use client"

import { useQuery } from "@tanstack/react-query"
import { Card } from "../../../../../components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "../../../../../components/ui/button"
import { useState } from "react"
import { Skeleton } from "../../../../../components/ui/skeleton"
import { EnnenniBankAccount } from "@prisma/client"


export function AccountDetailsList() {
  const [expandedAccounts, setExpandedAccounts] = useState<string[]>([])

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["enenni-bank-accounts"],
    queryFn: async () => {
      const response = await fetch("/api/enenni-bank-accounts")
      if (!response.ok) throw new Error("Failed to fetch bank accounts")
      return response.json() as Promise<EnnenniBankAccount[]>
    },
  })


  const toggleAccount = (id: string) => {
    setExpandedAccounts(prev =>
      prev.includes(id)
        ? prev.filter(accId => accId !== id)
        : [...prev, id]
    )
  }

  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />
  }

  return (
    <div className="space-y-4">
      {accounts?.map((account) => (
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
              {expandedAccounts.includes(account.id) ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {expandedAccounts.includes(account.id) && (
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