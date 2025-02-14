"use client";

import { ArrowUpRight, HelpCircle, MoveDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useFiatDepositModal } from "@/hooks/use-fiat-deposit-modal";
import { useFiatWithdrawalModal } from "@/hooks/use-fiat-withdrawal-modal";
import { useCryptoDepositModal } from "@/hooks/use-crypto-deposit-modal";
import { useCryptoWithdrawalModal } from "@/hooks/use-crypto-withdrawal-modal";

import { FiatDepositModal } from "@/components/modals/fiat-deposit-modal";
import { FiatWithdrawalModal } from "@/components/modals/fiat-withdrawal-modal";

import { CryptoDepositModal } from "@/components/modals/crypto-deposit-modal";
import { CryptoWithdrawalModal } from "@/components/modals/crypto-withdrawal-modal";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";


interface BalanceCardProps {
  isLoading?: boolean;
  balance?: string;
  currency?: string;
  type?: "crypto" | "fiat";
  onSuccess?: () => void;
}


export function BalanceCard({
  balance,
  currency,
  isLoading = false,
  type = "fiat",
  onSuccess,
}: BalanceCardProps) {
  const fiatDepositModal = useFiatDepositModal();
  const fiatWithdrawalModal = useFiatWithdrawalModal();
  const cryptoDepositModal = useCryptoDepositModal();
  const cryptoWithdrawalModal = useCryptoWithdrawalModal();

  const handleDeposit = () => {
    if (type === "fiat") {
      fiatDepositModal.onOpen();
    } else {
      cryptoDepositModal.onOpen();
    }
  };

  const handleWithdraw = () => {
    if (type === "fiat") {
      fiatWithdrawalModal.onOpen();
    } else {
      cryptoWithdrawalModal.onOpen();
    }
  };


  return (
    <>
      <Card>
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
            <Button
              onClick={handleDeposit}
              className="gap-2 w-full sm:w-auto px-6"
            >
              <MoveDown className="size-4" />
              Deposit
            </Button>
            <Button
              onClick={handleWithdraw}
              variant="outline"
              className="gap-2 w-full sm:w-auto px-6"
            >
              <ArrowUpRight className="size-4" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {type === "fiat" ? (
        <>
          <FiatDepositModal currency={currency} onSuccess={onSuccess}  />
          <FiatWithdrawalModal currency={currency} onSuccess={onSuccess} />
        </>

      ) : (
        <>
          <CryptoDepositModal cryptoType={currency} onSuccess={onSuccess} />
          <CryptoWithdrawalModal cryptoType={currency} onSuccess={onSuccess} />
        </>

      )}

    </>
  );
}
