"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, TransactionFormValues } from "@/lib/schemas/transaction";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createCryptoBalanceTransaction } from "@/lib/api/transactions";
import { useAuth } from "@/context/AuthContext";
import { CryptoType } from "@/types";

interface CryptoWithdrawalFormProps {
  cryptoType: CryptoType;
  networks: string[];
  currentBalance: number;
  onSuccess?: () => void;
  onClose: () => void;
}

export function CryptoWithdrawalForm({
  cryptoType,
  networks,
  currentBalance,
  onSuccess,
  onClose,
}: CryptoWithdrawalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  if (!user) {
    return <div>Loading...</div>;
  }
  const defaultValues: TransactionFormValues = {
    transactionType: "CRYPTO_WITHDRAWAL",
    amount: "",
    destinationAddress: "",
    cryptoType,
    network: "",
    memo: "",
  };

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  });
  const { control, handleSubmit, formState: { errors }, reset, setError } = form;

  const onSubmit = async (data: TransactionFormValues) => {
    if (parseFloat(data.amount) > currentBalance) {
      setError("amount", { message: "Insufficient Balance" });
      return;
    }
    try {
      setIsSubmitting(true);

      // Type narrowing to ensure we're dealing with a CRYPTO_WITHDRAWAL transaction
      if (data.transactionType !== "CRYPTO_WITHDRAWAL") {
        throw new Error("Invalid transaction type");
      }
      const response = await createCryptoBalanceTransaction({
        userId: user.id,
        cryptoType: data.cryptoType,
        amount: parseFloat(data.amount),
        walletAddress: data.destinationAddress,
        network: data.network,
        transactionType: data.transactionType,
        description: data.memo,
      });
      if (response.error) {
        throw new Error(response.error);
      }
      toast({
        title: "Success",
        description: "Withdrawal created successfully",
      });
      reset();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4">
        <FormField
          control={control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="Enter amount" />
              </FormControl>
              <FormMessage>{errors.amount?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="destinationAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Address</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter destination address" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="network"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Network</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
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
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="memo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Memo</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Add memo" />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting} loading={isSubmitting}>
          {isSubmitting ? "Processing..." : "Withdraw"}
        </Button>
      </form>
    </Form>
  );
} 