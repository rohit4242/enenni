"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNewBankAccountModal } from "@/hooks/use-new-bank-account";
import { newBankAccountSchema } from "@/lib/schemas/bank-account";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CurrencyType } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { FileUpload } from "@/components/ui/file-upload";

type NewBankAccountFormValues = {
  accountHolderName: string;
  accountType: "IBAN" | "ACCOUNT_NUMBER";
  iban?: string;
  verifyIban?: string;
  accountNumber?: string;
  verifyAccountNumber?: string;
  bankAddress: string;
  bankCountry: string;
  proofDocumentUrl: string;
  currency: CurrencyType;
};


const COUNTRIES = [
  { id: "AED", name: "United Arab Emirates" },
  { id: "USD", name: "United States" },

  // Add more countries as needed
];

export function NewBankAccountModal() {
  const { isOpen, onClose } = useNewBankAccountModal();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const queryClient = useQueryClient();

  const form = useForm<NewBankAccountFormValues>({
    resolver: zodResolver(newBankAccountSchema),
    defaultValues: {
      accountHolderName: "Rohit Luni",
      accountType: "IBAN",
      bankAddress: "",
      bankCountry: "",
      proofDocumentUrl: "",
      currency: CurrencyType.AED,
    },
  });

  const accountType = form.watch("accountType");

  const onSubmit = async (values: NewBankAccountFormValues) => {
    try {
      setLoading(true);

      // Validate IBAN/Account number match
      if (values.accountType === "IBAN" && values.iban !== values.verifyIban) {
        form.setError("verifyIban", { message: "IBAN numbers do not match" });
        return;
      }

      if (values.accountType === "ACCOUNT_NUMBER" &&
        values.accountNumber !== values.verifyAccountNumber) {
        form.setError("verifyAccountNumber", {
          message: "Account numbers do not match"
        });
        return;
      }

      const response = await fetch("/api/bank-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          proofDocumentUrl: uploadedUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });

      toast({
        title: "Success",
        description: "Bank account added successfully",
      });

      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add bank account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh]">
        <ScrollArea className="max-h-[calc(90vh-4rem)] overflow-y-auto">
          <DialogHeader className="px-2">
            <DialogTitle>Add New Bank Account</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-2">
              <FormField
                control={form.control}
                name="accountHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account holder name</FormLabel>
                    <FormControl>
                      <Input disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provide</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="IBAN" id="iban" />
                          <label htmlFor="iban">IBAN</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ACCOUNT_NUMBER" id="account" />
                          <label htmlFor="account">
                            Account number (if IBAN not available)
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {accountType === "IBAN" ? (
                <>
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
                  <FormField
                    control={form.control}
                    name="verifyIban"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verify IBAN</FormLabel>
                        <FormControl>
                          <Input disabled={loading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
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
                    name="verifyAccountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verify Account Number</FormLabel>
                        <FormControl>
                          <Input disabled={loading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="bankAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank address</FormLabel>
                    <FormControl>
                      <Textarea disabled={loading} {...field} />
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
                    <FormLabel>Bank country</FormLabel>
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

              <FormField
                control={form.control}
                name="proofDocumentUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload proof</FormLabel>
                    <FormControl>
                      <FileUpload
                        endpoint="imageUploader"
                        onChange={(url) => {
                          if (url) {
                            field.onChange(url);
                            setUploadedUrl(url);
                          }
                        }}

                      />
                    </FormControl>

                    <p className="text-sm text-muted-foreground">
                      Eg. Cancelled cheque, bank statement, IBAN certificate
                      etc.
                    </p>
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
                <Button type="submit" disabled={loading}>
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
