"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNewWalletModal } from "@/hooks/use-new-wallet-modal";
import { newWalletSchema, type NewWalletFormValues } from "@/lib/schemas/wallet";
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
import { createCryptoWallet } from "@/lib/api/crypto-wallets";
import { useQueryClient } from "@tanstack/react-query";

export function NewWalletModal() {
  const { isOpen, onClose } = useNewWalletModal();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<NewWalletFormValues>({
    resolver: zodResolver(newWalletSchema),
    defaultValues: {
      chain: "",
      walletAddress: "",
      nickname: "",
      cryptoCurrency: "BTC",
      walletType: "First party",
    },
  });

  const onSubmit = async (values: NewWalletFormValues) => {
    try {
      setLoading(true);

      if (!values || typeof values !== 'object') {
        throw new Error("Invalid wallet data");
      }
      const { error, status } = await createCryptoWallet(values);

      if (status !== 201) {
        throw new Error(error || "Failed to create wallet");
      }

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["crypto-wallets"] });

      toast({
        title: "Success",
        description: "Wallet created successfully",
      });

      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md min-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add an address</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">


            <FormField
              control={form.control}
              name="cryptoCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="USDT">Tether (USDT)</SelectItem>
                      <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chain</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select chain" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TRON">TRON</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet address</FormLabel>
                  <FormControl>
                    <Input disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      {...field}
                      placeholder="Eg. btc01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="walletType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet Type</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="First party">First Party</SelectItem>
                      <SelectItem value="Third party">Third Party</SelectItem>
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
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
              >
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 