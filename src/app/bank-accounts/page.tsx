"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/PageLayout"
import { Skeleton } from "@/components/ui/skeleton"

export default function BalancesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to AED balance by default
    router.push("/bank-accounts/aed")
  }, [router])

  return (
    <PageLayout
      heading="Bank Accounts"
      subheading="View and manage your bank accounts"
    >
      <div className="space-y-6">

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((index) => (
              <Skeleton key={index} className="h-[76px] w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
} 