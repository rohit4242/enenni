"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/PageLayout"
import { BalancesDataTable } from "./components/data-table"

export default function BalancesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to AED balance by default
    router.push("/balances/aed")
  }, [router])

  return (
    <PageLayout
      heading="Balances"
      subheading="View and manage your account balances"
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