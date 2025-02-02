"use client"
import { useNewBankAccountModal } from "@/hooks/use-new-bank-account"
import { BankAccountsDataTable } from "./components/data-table"
import { Button } from "@/components/ui/button"
import { BalanceCard } from "@/components/BalanceCard"
import { PageLayout } from "@/components/PageLayout"

export default function BankAccountsPage() {
    const modal = useNewBankAccountModal()
  return (
    <PageLayout
      heading="External Bank Accounts"
      subheading="Manage your connected bank accounts"
      actions={
        <Button 
          variant="outline" 
          onClick={modal.onOpen}
          className="text-teal-600 hover:text-teal-600"
        >
          + New Account
        </Button>
      }
    >
      <div className="space-y-6">
        <BalanceCard
          balance="0.95"
        />
        <BankAccountsDataTable />
      </div>
    </PageLayout>
  )
}
