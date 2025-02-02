"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/PageLayout"

export default function WalletsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to BTC wallet by default
    router.push("/wallets/btc")
  }, [router])

  return (
    <PageLayout
      heading="Wallets"
      subheading="View and manage your crypto wallets"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Loading...</h3>
          </div>
        </div>
      </div>
    </PageLayout>
  )
} 