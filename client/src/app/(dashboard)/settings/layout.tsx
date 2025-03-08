import { SidebarNav } from "@/components/SidebarNav";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings/profile",
  },
  {
    title: "External bank accounts",
    href: "/settings/bank-accounts",
  },
  {
    title: "Enenni bank account details",
    href: "/settings/account-details",
  },
  {
    title: "External wallets",
    href: "/settings/wallets",
  },
  {
    title: "Terms & conditions",
    href: "/settings/terms",
  },
  {
    title: "Statements",
    href: "/settings/statements",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-semibold text-white">Settings</h2>
        <p className="text-teal-100">Manage your account settings</p>
      </div>

      <div className="flex gap-6 min-h-[calc(100vh-12rem)]">
        <SidebarNav items={sidebarNavItems} className="w-1/4 h-full" />
        <div className="flex-1 p-6 bg-white rounded-lg shadow-md h-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
