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
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import LoginButton from "../auth/login-button";
import { useBalances } from "@/hooks/use-balances";
import { calculateTrade, TradeResult } from "@/lib/trade-calculations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CryptoAsset, fetchCryptoPrice, FiatCurrency, formatCurrency } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

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
  const { fiatBalances, cryptoBalances, loading: balancesLoading } = useBalances();
  const queryClient = useQueryClient();
  const [tradeResult, setTradeResult] = useState<TradeResult | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: fiatBalances[0]?.id || "",
      crypto: cryptoBalances[0]?.id || "",
      quantity: "",
      amount: "",
    },
  });

  useEffect(() => {
    if (fiatBalances.length) form.setValue("currency", fiatBalances[0].id);
    if (cryptoBalances.length) form.setValue("crypto", cryptoBalances[0].id);
  }, [fiatBalances, cryptoBalances, form]);

  const selectedCurrency = fiatBalances.find(curr => curr.id === form.watch("currency"));
  const selectedCrypto = cryptoBalances.find(crypto => crypto.id === form.watch("crypto"));

  const { data: currentPrice, isLoading: priceLoading, isError: priceError } = useQuery({
    queryKey: ["crypto-price", selectedCrypto?.id, selectedCurrency?.id],
    queryFn: () => fetchCryptoPrice(selectedCrypto?.id as CryptoAsset, selectedCurrency?.id as FiatCurrency),
    refetchInterval: 1000,
  });

  const handleInputChange = (field: "quantity" | "amount", value: string) => {
    form.setValue(field, value);
    form.setValue(field === "quantity" ? "amount" : "quantity", "");

    if (!currentPrice?.priceUSD) return;

    const result = calculateTrade({
      tradeType,
      [field]: value,
      currentPrice: currentPrice.priceUSD,
      availableFiatBalance: selectedCurrency?.balance,
      availableCryptoBalance: selectedCrypto?.balance,
    });

    setTradeResult(result);

    if (result.error) {
      toast({
        title: "Calculation Error",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.insufficientBalance) {
      const { type, required, available } = result.insufficientBalance;
      toast({
        title: "Insufficient Balance",
        description: type === "FIAT"
          ? `Insufficient ${selectedCurrency?.id} balance. Required: ${formatCurrency(required, selectedCurrency?.id || "")}, Available: ${formatCurrency(available, selectedCurrency?.id || "")}`
          : `Insufficient ${selectedCrypto?.id} balance. Required: ${required.toFixed(8)} ${selectedCrypto?.id}, Available: ${available.toFixed(8)} ${selectedCrypto?.id}`,
        variant: "destructive",
      });
    }
  };

  const handleRequestQuote = async (values: z.infer<typeof formSchema>) => {
    if (!session) {
      return toast({
        title: "Authentication required",
        description: "Please sign in to request a quote",
        variant: "destructive",
      });
    }

    if (!currentPrice?.priceUSD) {
      return toast({
        title: "Price Error",
        description: "Unable to get current price. Please try again.",
        variant: "destructive",
      });
    }

    const result = calculateTrade({
      tradeType,
      quantity: values.quantity,
      amount: values.amount,
      currentPrice: currentPrice.priceUSD,
      availableFiatBalance: selectedCurrency?.balance,
      availableCryptoBalance: selectedCrypto?.balance,
    });

    if (result.error) {
      return toast({
        title: "Calculation Error",
        description: result.error,
        variant: "destructive",
      });
    }

    if (result.insufficientBalance) {
      const { type, required, available } = result.insufficientBalance;
      return toast({
        title: "Insufficient Balance",
        description: type === "FIAT"
          ? `Insufficient ${selectedCurrency?.id} balance. Required: ${formatCurrency(required, selectedCurrency?.id || "")}, Available: ${formatCurrency(available, selectedCurrency?.id || "")}`
          : `Insufficient ${selectedCrypto?.id} balance. Required: ${required.toFixed(8)} ${selectedCrypto?.id}, Available: ${available.toFixed(8)} ${selectedCrypto?.id}`,
        variant: "destructive",
      });
    }

    try {
      setLoading(true);
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          tradeType,
          currentPrice: currentPrice.priceUSD,
          calculatedAmount: result.calculatedAmount,
          calculatedQuantity: result.calculatedQuantity,
          tradeFee: result.tradeFee,
          netAmount: result.netAmount,
          userId: session.user.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to get quote");

      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      
      toast({
        title: "Quote Created",
        description: `${tradeType} quote created successfully`,
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
            <form onSubmit={form.handleSubmit(handleRequestQuote)} className="space-y-4">
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
                            {fiatBalances.map(currency => (
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
                            {cryptoBalances.map(crypto => (
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
                          onChange={(e) => handleInputChange("quantity", e.target.value)}
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
                          onChange={(e) => handleInputChange("amount", e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="h-10" disabled={loading || priceLoading}>
                  {loading || priceLoading ? "Loading..." : "Request Quote"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {tradeResult && !tradeResult.error && (
                <div className="mt-4 space-y-2 p-4 border rounded-lg bg-muted/50">
                  <div className="flex justify-between">
                    <span>Calculated Amount:</span>
                    <span className="font-medium">
                      {formatCurrency(tradeResult.calculatedAmount, selectedCurrency?.id || "")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="font-medium">
                      {tradeResult.calculatedQuantity.toFixed(8)} {selectedCrypto?.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee (0.5%):</span>
                    <span className="font-medium">
                      {formatCurrency(tradeResult.tradeFee, selectedCurrency?.id || "")}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Net {tradeType === "BUY" ? "Cost" : "Proceeds"}:</span>
                    <span className={tradeResult.insufficientBalance ? "text-destructive" : ""}>
                      {formatCurrency(tradeResult.netAmount, selectedCurrency?.id || "")}
                    </span>
                  </div>
                  {tradeResult.insufficientBalance && (
                    <div className="mt-2 p-2 border border-destructive rounded text-destructive text-sm">
                      {tradeResult.insufficientBalance.type === "FIAT"
                        ? `Insufficient ${selectedCurrency?.id} balance`
                        : `Insufficient ${selectedCrypto?.id} balance`}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                {selectedCurrency && (
                  <p className="mt-2 text-md font-bold text-muted-foreground">
                    Available {selectedCurrency.id}: {formatCurrency(selectedCurrency.balance, selectedCurrency.id)}
                  </p>
                )}
                {selectedCrypto && (
                  <p className="mt-2 text-md font-bold text-muted-foreground">
                    Available {selectedCrypto.id}: {formatCurrency(selectedCrypto.balance, selectedCrypto.id)}
                  </p>
                )}
              </div>
              {priceLoading ? (
                <Skeleton className="h-10 w-32" />
              ) : priceError ? (
                <div className="text-red-500">Error fetching price</div>
              ) : (
                <div className="text-md font-bold text-muted-foreground">
                  {/* crypto name per fiat currency */}
                  {formatCurrency(currentPrice?.priceUSD || 0, selectedCrypto?.id || "")} {selectedCurrency?.id}/{selectedCrypto?.id}
                </div>
              )}
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
