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
    <div className="max-w-screen-xl mx-auto sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white">Settings</h2>
        <p className="text-teal-100">Manage your account settings</p>
      </div>



      <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-12rem)]">
       
               {/* Desktop sidebar - hidden on mobile */}
       <div className="hidden md:block md:w-1/4">
          <SidebarNav items={sidebarNavItems} className="h-auto" />
        </div>

         {/* Mobile navigation - only visible on mobile */}
         <div className="md:hidden bg-slate-900 rounded-md">
            <SidebarNav items={sidebarNavItems} />
          </div>
        {/* Content area with mobile navigation */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md">
         
          <div className="p-4 sm:p-6 ">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
