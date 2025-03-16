"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownUp, Info, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

// Mock exchange rates (in a real app, these would come from an API)
const exchangeRates = {
  BTC: { BTC: 1, ETH: 15.82, USDT: 65850, USDC: 65800 },
  ETH: { BTC: 0.063, ETH: 1, USDT: 4150, USDC: 4145 },
  USDT: { BTC: 0.000015, ETH: 0.00024, USDT: 1, USDC: 0.999 },
  USDC: { BTC: 0.000015, ETH: 0.00024, USDT: 1.001, USDC: 1 },
};

type FormValues = {
  amountToSend: number;
  currencyToSend: "BTC" | "ETH" | "USDT" | "USDC";
  amountToReceive: number;
  currencyToReceive: "BTC" | "ETH" | "USDT" | "USDC";
};

export function CryptoExchangeForm() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [fee, setFee] = useState<number>(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amountToSend: 0,
      currencyToSend: "BTC",
      amountToReceive: 0,
      currencyToReceive: "ETH",
    },
  });

  const watchAmountToSend = form.watch("amountToSend");
  const watchCurrencyToSend = form.watch("currencyToSend");
  const watchCurrencyToReceive = form.watch("currencyToReceive");

  // Calculate the exchange rate and update the receive amount
  useEffect(() => {
    const calculateExchange = async () => {
      if (watchAmountToSend > 0) {
        setIsCalculating(true);

        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Get the exchange rate from our mock data
          const rate =
            exchangeRates[watchCurrencyToSend as keyof typeof exchangeRates][
              watchCurrencyToReceive as keyof typeof exchangeRates
            ];
          setExchangeRate(rate);

          // Calculate fee (0.5% in this example)
          const calculatedFee = watchAmountToSend * 0.005;
          setFee(calculatedFee);

          // Calculate amount to receive
          const receiveAmount = (watchAmountToSend - calculatedFee) * rate;

          // Update the form
          form.setValue(
            "amountToReceive",
            parseFloat(receiveAmount.toFixed(8))
          );
        } catch (error) {
          console.error("Error calculating exchange:", error);
        } finally {
          setIsCalculating(false);
        }
      } else {
        form.setValue("amountToReceive", 0);
        setExchangeRate(null);
        setFee(0);
      }
    };

    calculateExchange();
  }, [watchAmountToSend, watchCurrencyToSend, watchCurrencyToReceive, form]);

  // Swap currencies
  const handleSwapCurrencies = () => {
    const currentSendCurrency = form.getValues("currencyToSend");
    const currentReceiveCurrency = form.getValues("currencyToReceive");

    form.setValue("currencyToSend", currentReceiveCurrency);
    form.setValue("currencyToReceive", currentSendCurrency);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    console.log("Form Data:", data);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Handle the exchange logic here

      // Reset form or show success message
      form.reset({
        amountToSend: 0,
        currencyToSend: "BTC",
        amountToReceive: 0,
        currencyToReceive: "ETH",
      });
    } catch (error) {
      console.error("Exchange error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : parseFloat(e.target.value);
                      field.onChange(value);
                    }}
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
                  <Select value={field.value} onValueChange={field.onChange}>
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

          <div className="relative flex justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-background border border-input flex items-center justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full p-0"
                  onClick={handleSwapCurrencies}
                >
                  <ArrowDownUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="border-t border-input w-full my-4"></div>
          </div>

          <div className="flex items-center space-x-2">
            <FormField
              control={form.control}
              name="amountToReceive"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>You get</FormLabel>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="≈ 0.0"
                      {...field}
                      readOnly
                      className={isCalculating ? "opacity-50" : ""}
                    />
                    {isCalculating && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
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
                  <Select value={field.value} onValueChange={field.onChange}>
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

          {/* Exchange Rate Card */}
          {watchAmountToSend > 0 && exchangeRate && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4 pb-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Exchange Rate</span>
                    <span>
                      1 {watchCurrencyToSend} ≈ {exchangeRate.toFixed(6)}{" "}
                      {watchCurrencyToReceive}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-1">
                        Fee (0.5%)
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>0.5% fee is applied to the amount you send</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span>
                      {fee.toFixed(6)} {watchCurrencyToSend}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-border">
                    <span className="font-medium">You will receive</span>
                    <span className="font-medium">
                      {form.getValues("amountToReceive").toFixed(6)}{" "}
                      {watchCurrencyToReceive}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || watchAmountToSend <= 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Exchange"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
