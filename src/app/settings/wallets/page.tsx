import { WalletsDataTable } from "./components/data-table"
import { Button } from "@/components/ui/button"
import { PageLayout } from "@/components/PageLayout"

export default function WalletsPage() {
  return (
    <PageLayout
      heading="External Wallets"
      subheading="Manage your connected wallet addresses"
      actions={
        <Button variant="outline" className="text-primary hover:text-primary">
          Wallet +
        </Button>
      }
    >
      <WalletsDataTable />
    </PageLayout>
  )
} 