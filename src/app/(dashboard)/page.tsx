"use client";
import React from "react";
import { BuySellCard } from "@/components/dashboard/BuySellCard";
import { LiveChart } from "@/components/LiveChart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">
          Welcome Back, Genrative 👋
        </h1>
        <p className="text-teal-100">This is your Financial Overview Report</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <BuySellCard />
        {/* <QuotesCard /> */}
      </div>
      <div className="flex flex-col space-y-4">
        <LiveChart />
      </div>
    </div>
  );
}
