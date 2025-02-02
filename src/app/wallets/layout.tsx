import { WalletsSidebar } from "./components/wallets-sidebar"

export default function WalletsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen max-w-screen-2xl mx-auto p-6 gap-6">
      {/* Sidebar with wallet cards */}
      <div className="w-full md:w-80 space-y-4">
        <WalletsSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 