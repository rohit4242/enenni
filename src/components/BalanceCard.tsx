"use client";

import { ArrowUpRight, HelpCircle, MoveDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface BalanceCardProps {
  balance?: string;
  currency?: string;
  isLoading?: boolean;
}

export function BalanceCard({
  balance,
  currency = "AED",
  isLoading = false,
}: BalanceCardProps) {
  return (
    <Card className="bg-card/50">
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">
              Available to trade
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="size-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is your available balance for trading</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-2xl font-semibold tracking-tight">
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              `${balance || "0"} ${currency}`
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button className="gap-2 w-full sm:w-auto px-6">
            <MoveDown className="size-4" />
            Deposit
          </Button>
          <Button variant="outline" className="gap-2 w-full sm:w-auto px-6">
            <ArrowUpRight className="size-4" />
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
