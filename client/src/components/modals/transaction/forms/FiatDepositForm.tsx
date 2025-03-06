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

interface FiatDepositFormProps {
  currency: CurrencyType;
  bankAccounts: BankAccount[];
  onSuccess?: () => void;
  onClose: () => void;
}

export function FiatDepositForm({ currency, bankAccounts, onSuccess, onClose }: FiatDepositFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const defaultValues: TransactionFormValues = {
    transactionType: "FIAT_DEPOSIT",
    amount: "",
    bankAccountId: "", // Ensure this is correctly typed in the schema
    currency,
    description: `${currency} Deposit`,
  };

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  });
  const { control, handleSubmit, formState: { errors }, reset } = form;

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Type narrowing to ensure we're dealing with a FIAT_DEPOSIT transaction
      if (data.transactionType !== "FIAT_DEPOSIT") {
        throw new Error("Invalid transaction type");
      }

      
      const response = await createFiatBalanceTransaction({
        userId: user.id,
        amount: parseFloat(data.amount),
        currency,
        accountId: data.bankAccountId, // Now TypeScript knows this exists
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
          {isSubmitting ? "Processing..." : "Deposit"}
        </Button>
      </form>
    </Form>
  );
}