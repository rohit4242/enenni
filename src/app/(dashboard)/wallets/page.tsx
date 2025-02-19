"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to BTC wallet by default
    router.push("/wallets/btc");
  }, [router]);

  return (
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
  );
}
