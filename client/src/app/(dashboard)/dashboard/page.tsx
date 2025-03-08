"use client";

import React, { useEffect, useState } from "react";
import { LiveChart } from "@/components/LiveChart";
import { useAuth } from "@/context/AuthContext";
import ExchangeCard from "./_components/exchange-card";
import { QuotesWrapper } from "@/components/dashboard/quotes-wrapper";

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);


  return (
    <div className="space-y-6">
      {isMounted && (
        <>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-white">
              Dashboard, {user?.name} {'\u{1F42C}'}
            </h1>
            <p className="text-teal-100">This is your Financial Overview Report</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ExchangeCard />
            <QuotesWrapper />
          </div>
          <div className="flex flex-col space-y-4">
            <LiveChart />
          </div>
        </>
      )}
    </div>
  );
} 