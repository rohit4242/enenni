"use client";

import React, { useEffect, useState } from "react";
import { LiveChart } from "@/components/LiveChart";
import { useAuthContext } from "@/context/AuthContext";
import ExchangeCard from "@/components/exchange-card";
import { QuotesWrapper } from "@/components/dashboard/quotes-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const { user, isLoading, refetch } = useAuthContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsMounted(true);

    // Refetch user data when the component mounts
    // This ensures we have the latest user data after login
    if (isMounted) {
      refetch();

      // Also invalidate the auth query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    }
  }, [isMounted, refetch, queryClient]);

  // Render a skeleton during server-side rendering
  if (!isMounted || isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">
          Hello, {user?.name} {"\u{1F42C}"}
        </h1>
        <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ExchangeCard />
        <QuotesWrapper />
      </div>
      <div className="flex flex-col space-y-4">
        <LiveChart />
      </div>
    </div>
  );
}
