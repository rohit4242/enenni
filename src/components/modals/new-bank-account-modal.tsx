"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNewBankAccountModal } from "@/hooks/use-new-bank-account";
import { newBankAccountSchema, type NewBankAccountFormValues } from "@/lib/schemas/bank-account";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const CURRENCIES = [
  { id: "USD", name: "US Dollar" },
  { id: "EUR", name: "Euro" },
  { id: "GBP", name: "British Pound" },
  { id: "CHF", name: "Swiss Franc" },
];

const COUNTRIES = [
  { id: "US", name: "United States" },
  { id: "GB", name: "United Kingdom" },
  { id: "DE", name: "Germany" },
  { id: "FR", name: "France" },
  { id: "CH", name: "Switzerland" },
];

export function NewBankAccountModal() {
  const { isOpen, onClose } = useNewBankAccountModal();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<NewBankAccountFormValues>({
    resolver: zodResolver(newBankAccountSchema),
    defaultValues: {
      accountHolder: "",
      bankName: "",
      accountNumber: "",
      iban: "",
      currency: "",
      bankAddress: "",
      bankCountry: "",
    },
  });

  const onSubmit = async (values: NewBankAccountFormValues) => {
    try {
      setLoading(true);
      const response = await fetch("/api/bank-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create bank account");
      }

      toast({
        title: "Success",
        description: "Bank account added successfully",
      });
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add bank account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Add New Bank Account</DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accountHolder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Holder Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN</FormLabel>
                    <FormControl>
                      <Input disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.id} value={currency.id}>
                          {currency.name}
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
              name="bankAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Address</FormLabel>
                  <FormControl>
                    <Input disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Country</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} loading={loading}>
                Add Bank Account
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 