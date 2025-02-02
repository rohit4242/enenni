import { BalancesSidebar } from "./components/balances-sidebar"

export default function BalancesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen max-w-screen-2xl mx-auto p-6 gap-6">
      {/* Sidebar with balance cards */}
      <div className="w-full md:w-80 space-y-4">
        <BalancesSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 