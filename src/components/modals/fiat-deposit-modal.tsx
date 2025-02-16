"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useFiatDepositModal,
  fiatDepositSchema,
} from "@/hooks/use-fiat-deposit-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserBankAccounts } from "@/hooks/use-user-bank-accounts";
import { CurrencyType, UserBankAccount } from "@prisma/client";
import { useState } from "react";
import { createTransaction } from "@/actions/transactions";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useFiatTransactionInfoModal } from "./fiat-transaction-info-modal";

interface FiatDepositModalProps {
  currency?: string;
  onSuccess?: () => void;
}

export function FiatDepositModal({
  currency,
  onSuccess,
}: FiatDepositModalProps) {
  const { isOpen, onClose, form: initialForm } = useFiatDepositModal();
  const { bankAccounts, isLoading } = useUserBankAccounts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDesktop = useIsMobile();
  const transactionInfoModal = useFiatTransactionInfoModal();

  const form = useForm({
    resolver: zodResolver(fiatDepositSchema),
    defaultValues: {
      amount: initialForm.amount,
      bankAccountId: initialForm.bankAccountId,
      currency: currency || initialForm.currency,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const result = await createTransaction({
        type: "FIAT_DEPOSIT",
        amount: data.amount,
        currency: currency as CurrencyType,
        bankAccountId: data.bankAccountId,
        description: `${currency} Deposit`,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Show transaction info modal
      transactionInfoModal.onOpen({
        referenceId: result.transaction?.referenceId || "",
        amount: data.amount,
        currency: currency as CurrencyType,
      });

      form.reset();
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Deposit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDesktop) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Deposit {currency}</DrawerTitle>
          </DrawerHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-4"
            >
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank account" />
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
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Deposit"}
              </Button>
            </form>
          </Form>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit {currency}</DialogTitle>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank account" />
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
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Deposit"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
