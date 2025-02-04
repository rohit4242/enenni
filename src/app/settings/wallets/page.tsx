"use client";

import { WalletsDataTable } from "./components/data-table"
import { Button } from "@/components/ui/button"
import { PageLayout } from "@/components/PageLayout"
import { useNewWalletModal } from "@/hooks/use-new-wallet-modal"

export default function WalletsPage() {
  const { onOpen } = useNewWalletModal()

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
      <WalletsDataTable />
    </PageLayout>
  )
} 