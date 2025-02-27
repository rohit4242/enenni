"use client";

import {
  Bitcoin,
  ChevronRight,
  DollarSign,
  EclipseIcon as Ethereum,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "./ui/card";
import { cn } from "../lib/utils";

interface CurrencyCardProps {
  type: "USDC" | "BTC" | "ETH" | "USDT" | "AED" | "USD" | "EUR" | "GBP";
  isActive?: boolean;
  variant?: "wallet" | "balances";
}

export default function CurrencyCard({
  type,
  isActive,
  variant = "wallet",
}: CurrencyCardProps) {
  const router = useRouter();
  const getCurrencyIcon = () => {
    switch (type) {
      case "USDC":
        return <DollarSign className="size-6 text-blue-500" />;
      case "BTC":
        return <Bitcoin className="size-6 text-orange-500" />;
      case "ETH":
        return <Ethereum className="size-6 text-purple-500" />;
      case "USDT":
        return (
          <div className="flex size-6 items-center justify-center rounded-full bg-teal-500 text-white">
            <span className="text-xs font-bold">₮</span>
          </div>
        );
      case "AED":
        return <DollarSign className="size-6 text-green-500" />;
      case "USD":
        return <DollarSign className="size-6 text-emerald-500" />;
      case "EUR":
        return (
          <div className="flex size-6 items-center justify-center rounded-full bg-blue-500 text-white">
            <span className="text-xs font-bold">€</span>
          </div>
        );
      case "GBP":
        return (
          <div className="flex size-6 items-center justify-center rounded-full bg-indigo-500 text-white">
            <span className="text-xs font-bold">£</span>
          </div>
        );
    }
  };

  const getCurrencyName = () => {
    switch (type) {
      case "USDC":
        return "Circle USD";
      case "BTC":
        return "Bitcoin";
      case "ETH":
        return "Ethereum";
      case "USDT":
        return "Tether";
      case "AED":
        return "UAE Dirham";
      case "USD":
        return "US Dollar";
      case "EUR":
        return "Euro";
      case "GBP":
        return "British Pound";
    }
  };

  const handleClick = () => {
    const basePath = variant === "wallet" ? "/wallets" : "/balances";
    router.push(`${basePath}/${type.toLowerCase()}`);
  };

  return (
    <Card
      className={cn(
        "group relative cursor-pointer transition-colors hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30",
        isActive ? "bg-slate-100/30 text-white" : "bg-slate-100/10"
      )}
      onClick={handleClick}
    >
      <CardContent className="flex items-center gap-3 p-2">
        <div className="flex size-6 items-center justify-center rounded-full bg-muted">
          {getCurrencyIcon()}
        </div>
        <div className="flex flex-1 flex-col">
          <span className="font-medium">{getCurrencyName()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
