import { SidebarNav } from "@/components/SidebarNav"
import { PageLayout } from "@/components/PageLayout"

const sidebarNavItems = [
  {
    title: "External bank accounts",
    href: "/settings/bank-accounts",
  },
  {
    title: "Fuze bank account details",
    href: "/settings/account-details",
  },
  {
    title: "External wallets",
    href: "/settings/wallets",
  },
  {
    title: "Security",
    href: "/settings/security",
  },
  {
    title: "Terms & conditions",
    href: "/settings/terms",
  },
  {
    title: "Statements",
    href: "/settings/statements",
  },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <PageLayout sidebar={<SidebarNav items={sidebarNavItems} />}>
      {children}
    </PageLayout>
  )
}
