"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  amountToSend: z.number().min(0.01, "Amount must be greater than 0"),
  currencyToSend: z.enum(["BTC", "ETH", "USDT", "USDC"], {
    errorMap: () => ({ message: "Please select a currency to send" }),
  }),
  amountToReceive: z.number().optional(),
  currencyToReceive: z.enum(["BTC", "ETH", "USDT", "USDC"], {
    errorMap: () => ({ message: "Please select a currency to receive" }),
  }),
});

export function CryptoExchangeForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amountToSend: 0,
      currencyToSend: "BTC",
      amountToReceive: undefined,
      currencyToReceive: "ETH",
    },
  });

  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
    // Handle the exchange logic here
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="amountToSend"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>You send</FormLabel>
                <Input
                  type="number"
                  placeholder="0.0"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currencyToSend"
            render={({ field }) => (
              <FormItem className="w-32">
                <FormLabel>Crypto</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="BTC" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="amountToReceive"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>You get</FormLabel>
                <Input
                  type="number"
                  placeholder="≈ 0.0"
                  {...field}
                  readOnly
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currencyToReceive"
            render={({ field }) => (
              <FormItem className="w-32">
                <FormLabel>Crypto</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ETH" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">Exchange</Button>
      </form>
    </Form>
  );
}