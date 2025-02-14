"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import LoginButton from "@/components/auth/login-button";
import { useBalances } from "@/hooks/use-balances";
import { useCryptoPrice } from "@/hooks/use-crypto-price";
import { calculateTrade } from "@/lib/trade-calculations";
import { LiveCryptoPrice } from "@/components/LiveCryptoPrice";
import { useLiveCryptoPrice } from "@/hooks/use-live-crypto-price";
import { useQueryClient } from "@tanstack/react-query";
const formSchema = z
  .object({
    currency: z.string().min(1, "Please select a currency"),
    crypto: z.string().min(1, "Please select a crypto"),
    quantity: z.string().optional(),
    amount: z.string().optional(),
  })
  .refine((data) => data.quantity || data.amount, {
    message: "Either quantity or amount must be provided",
  });

export function BuySellCard() {
  const { data: session } = useSession();
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const {
    fiatBalances,
    cryptoBalances,
    loading: balancesLoading,
  } = useBalances();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: fiatBalances.length > 0 ? fiatBalances[0].id : "",
      crypto: cryptoBalances.length > 0 ? cryptoBalances[0].id : "",
      quantity: "",
      amount: "",
    },
  });

  useEffect(() => {
    if (fiatBalances.length > 0) {
      form.setValue("currency", fiatBalances[0].id);
    }
    if (cryptoBalances.length > 0) {
      form.setValue("crypto", cryptoBalances[0].id);
    }
  }, [fiatBalances, cryptoBalances, form]);

  const selectedCurrency = fiatBalances.find(
    (curr) => curr.id === form.watch("currency")
  );

  const selectedCrypto = cryptoBalances.find(
    (crypto) => crypto.id === form.watch("crypto")
  );

  const { data: currentPrice } = useLiveCryptoPrice(
    form.watch("crypto"),
    form.watch("currency")
  );

  useEffect(() => {
    const quantity = form.watch("quantity");
    const amount = form.watch("amount");

    if (currentPrice && (quantity || amount)) {
      const calculation = calculateTrade(
        amount || null,
        quantity || null,
        currentPrice?.price || 0,
        selectedCurrency?.balance || 0,
        tradeType
      );

      if (quantity) {
        form.setValue("amount", calculation.amount?.toString() || "");
      } else if (amount) {
        form.setValue("quantity", calculation.quantity?.toString() || "");
      }
    }
  }, [currentPrice, tradeType]);

  const handleRequestQuote = async (values: z.infer<typeof formSchema>) => {
    if (!session) {
      return toast({
        title: "Authentication required",
        description: "Please sign in to request a quote",
        variant: "destructive",
      });
    }

    const calculation = calculateTrade(
      values.amount || null,
      values.quantity || null,
      currentPrice?.price || 0,
      selectedCurrency?.balance || 0,
      tradeType
    );

    if (calculation.error) {
      return toast({
        title: "Error",
        description: calculation.error,
        variant: "destructive",
      });
    }

    try {
      setLoading(true);

      console.log("calculation: ", calculation.amount, calculation.quantity);
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          tradeType,
          currentPrice,
          calculatedAmount: calculation.amount,
          calculatedQuantity: calculation.quantity,
        }),
      });

      if (!response.ok) throw new Error("Failed to get quote");

      queryClient.invalidateQueries({ queryKey: ["quotes"] });

      toast({
        title: "Quote received",
        description: "Your quote is valid for 30 seconds",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to get quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full h-auto">
      <CardHeader>
        <CardTitle>Buy/Sell</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {!session ? (
          <div className="text-center p-4">
            <p className="mb-4">Please sign in to trade</p>
            <LoginButton mode="modal" asChild>
              <Button>Sign in to Trade</Button>
            </LoginButton>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleRequestQuote)}
              className="space-y-4"
            >
              <div className="flex flex-col md:flex-row gap-2">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={balancesLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {fiatBalances.map((currency) => (
                              <SelectItem key={currency.id} value={currency.id}>
                                {currency.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="crypto"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={balancesLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Crypto" />
                          </SelectTrigger>
                          <SelectContent>
                            {cryptoBalances.map((crypto) => (
                              <SelectItem key={crypto.id} value={crypto.id}>
                                {crypto.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <Button
                  type="button"
                  variant={tradeType === "BUY" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setTradeType("BUY")}
                >
                  Buy
                </Button>
                <Button
                  type="button"
                  variant={tradeType === "SELL" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setTradeType("SELL")}
                >
                  Sell
                </Button>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-2">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Quantity"
                          type="number"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue("amount", "");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <span className="text-muted-foreground">or</span>

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Amount"
                          type="number"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue("quantity", "");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="h-10" disabled={loading}>
                  {loading ? "Loading..." : "Request Quote"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center">
                {selectedCurrency && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Available {selectedCurrency.id}: {selectedCurrency.balance}
                  </p>
                )}
                {selectedCrypto && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Available {selectedCrypto.id}: {selectedCrypto.balance}
                  </p>
                )}
              </div>
              <LiveCryptoPrice />

            </form>
          </Form>
        )}
      </CardContent>

    </Card>
  );
}
