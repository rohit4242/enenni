"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { create } from "zustand";
import { CurrencyType } from "@/lib/types/db";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getEnenniBankAccounts } from "@/lib/api/enenni-bank-accounts";

interface TransactionInfo {
  referenceId: string;
  amount: string;
  currency: CurrencyType;
}

interface FiatTransactionInfoStore {
  isOpen: boolean;
  transactionInfo: TransactionInfo | null;
  onOpen: (info: TransactionInfo) => void;
  onClose: () => void;
}

export const useFiatTransactionInfoModal = create<FiatTransactionInfoStore>((set) => ({
  isOpen: false,
  transactionInfo: null,
  onOpen: (info) => set({ isOpen: true, transactionInfo: info }),
  onClose: () => set({ isOpen: false, transactionInfo: null }),
}));

export function FiatTransactionInfoModal() {
  const { isOpen, onClose, transactionInfo } = useFiatTransactionInfoModal();

  const { data: companyBankAccount, isLoading } = useQuery({
    queryKey: ["companyBankAccount", transactionInfo?.currency],
    queryFn: () => getEnenniBankAccounts(),
  });

  if (!transactionInfo) return null;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Deposit amount</span>
                <span className="font-medium">
                  {transactionInfo.amount} {transactionInfo.currency}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground pr-2">Reference ID </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{transactionInfo.referenceId}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(transactionInfo.referenceId)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-3">Company Bank Details</h3>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bank Name</span>
                  <span className="font-medium">{companyBankAccount?.bankName}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account Name</span>
                  <span className="font-medium">{companyBankAccount?.accountName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{companyBankAccount?.accountNumber}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(companyBankAccount?.accountNumber || "")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">IBAN</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{companyBankAccount?.iban}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(companyBankAccount?.iban || "")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Swift Code</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{companyBankAccount?.swiftCode}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(companyBankAccount?.swiftCode || "")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 