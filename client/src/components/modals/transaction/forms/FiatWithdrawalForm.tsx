"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CurrencyType } from "@/types";
import { transactionSchema, TransactionFormValues } from "@/lib/schemas/transaction";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { createFiatBalanceTransaction } from "@/lib/api/transactions";
import { useAuth } from "@/context/AuthContext";

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber?: string;
  iban?: string;
}

interface FiatWithdrawalFormProps {
  currency: CurrencyType;
  bankAccounts: BankAccount[];
  currentBalance: number;
  onSuccess?: () => void;
  onClose: () => void;
}

export function FiatWithdrawalForm({ currency, bankAccounts, currentBalance, onSuccess, onClose }: FiatWithdrawalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const defaultValues: TransactionFormValues = {
    transactionType: "FIAT_WITHDRAWAL",
    amount: "",
    bankAccountId: "",
    currency,
    description: `${currency} Withdrawal`,
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

      // Type narrowing to ensure we're dealing with a FIAT_WITHDRAWAL transaction
      if (data.transactionType !== "FIAT_WITHDRAWAL") {
        throw new Error("Invalid transaction type");
      }
      const response = await createFiatBalanceTransaction({
        userId: user.id,
        amount: parseFloat(data.amount),
        currency: currency,
        transactionType: data.transactionType,
        accountId: data.bankAccountId,
        description: data.description,
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
          name="bankAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Account</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bankName} - {account.accountNumber || account.iban}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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