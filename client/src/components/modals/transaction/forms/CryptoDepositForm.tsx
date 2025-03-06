"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  transactionSchema,
  TransactionFormValues,
} from "@/lib/schemas/transaction";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Loader2 } from "lucide-react";
import { handleCopyAddress } from "@/lib/utils";
import { getCryptoBalanceByCryptoType } from "@/lib/api/crypto-balances";
import { useQuery } from "@tanstack/react-query";
import { createCryptoBalanceTransaction } from "@/lib/api/transactions";
import { useAuth } from "@/context/AuthContext";
import { CryptoType } from "@/types";

interface CryptoDepositFormProps {
  cryptoType: CryptoType;
  networks: string[];
  onSuccess?: () => void;
  onClose: () => void;
}

export function CryptoDepositForm({
  cryptoType,
  networks,
  onSuccess,
  onClose,
}: CryptoDepositFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQRLoading, setIsQRLoading] = useState(true);
  const { user } = useAuth();
  if (!user) {
    return <div>Loading...</div>;
  }
  const defaultValues: TransactionFormValues = {
    transactionType: "CRYPTO_DEPOSIT",
    amount: "",
    cryptoType,
    walletAddress: "",
    network: "",
    description: `${cryptoType} Deposit`,
  };

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = form;

  const { data: walletData, isLoading } = useQuery({
    queryKey: ["wallet", "crypto", cryptoType],
    queryFn: async () => {
      const balance = await getCryptoBalanceByCryptoType(cryptoType);
      return balance.data;
    },
    retry: 1,
  });

  const walletAddress = walletData?.walletAddress;
  const walletLoading = isLoading;

  // Auto-populate the walletAddress field when the hook returns a value.
  useEffect(() => {
    if (walletAddress) {
      setValue("walletAddress", walletAddress);
      setIsQRLoading(false);
    }
  }, [walletAddress, setValue]);

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      setIsSubmitting(true);

      // Type narrowing to ensure we're dealing with a CRYPTO_DEPOSIT transaction
      if (data.transactionType !== "CRYPTO_DEPOSIT") {
        throw new Error("Invalid transaction type");
      }

      const response = await createCryptoBalanceTransaction({
        userId: user.id,
        cryptoType: data.cryptoType,
        amount: parseFloat(data.amount),
        walletAddress: data.walletAddress,
        network: data.network,
        transactionType: data.transactionType,
        description: data.description,
      });
      if (!response.success) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Deposit created successfully",
      });
      reset();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create deposit",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-2">
        <FormField
          control={control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="0.00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="cryptoType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={cryptoType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="network"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chain</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network} value={network}>
                        {network}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isQRLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {walletAddress && (
              <>
                <FormField
                  control={control}
                  name="walletAddress"
                  render={() => (
                    <FormItem>
                      <FormLabel>Deposit address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
                            <span className="flex-1 text-sm">{walletAddress}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleCopyAddress(
                                  walletAddress,
                                  "Deposit address has been copied to clipboard",
                                  "Address copied"
                                )
                              }
                              type="button"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Deposit address QR code</FormLabel>
                  <FormControl>
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <QRCodeSVG value={walletAddress} size={200} />
                    </div>
                  </FormControl>
                </FormItem>
              </>
            )}
          </>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || walletLoading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm Deposit"
          )}
        </Button>
      </form>
    </Form>
  );
}
