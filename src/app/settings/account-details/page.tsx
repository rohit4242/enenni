import { AccountDetailsList } from "./components/account-details-list"
import { PageLayout } from "@/components/PageLayout"

export default function AccountDetailsPage() {
  return (
    <PageLayout
      heading="Enenni bank accounts"
      subheading="View your bank account details"
    >
      <AccountDetailsList />
    </PageLayout>
  )
} 