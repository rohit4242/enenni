"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFiatWithdrawalModal, fiatWithdrawalSchema } from "@/hooks/use-fiat-withdrawal-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUserBankAccounts } from "@/hooks/use-user-bank-accounts";
import { CurrencyType, UserBankAccount } from "@prisma/client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createTransaction } from "@/actions/transactions";

interface FiatWithdrawalModalProps {
  currency?: string;
  onSuccess?: () => void;
}



export function FiatWithdrawalModal({ currency, onSuccess }: FiatWithdrawalModalProps) {
  const { isOpen, onClose, form: initialForm } = useFiatWithdrawalModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { bankAccounts, isLoading } = useUserBankAccounts();


  const form = useForm({
    resolver: zodResolver(fiatWithdrawalSchema),
    defaultValues: {
      amount: initialForm.amount,
      bankAccountId: initialForm.bankAccountId,
      currency: currency || initialForm.currency,
      description: initialForm.description,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createTransaction({
        type: "FIAT_WITHDRAWAL",
        amount: data.amount,
        currency: data.currency as CurrencyType,
        bankAccountId: data.bankAccountId,
        description: `${data.currency} Withdrawal`,
      });

      form.reset();
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Withdrawal error:", error);
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw {currency}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
              name="bankAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading..." : "Select bank account"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>

                      {bankAccounts?.map((account: UserBankAccount) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.bankName} - {account.accountNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Add a note to your withdrawal" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting} loading={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Withdraw"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 