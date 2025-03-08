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
import LoginButton from "@/components/auth/login-button";
import { calculateTrade, TradeResult } from "@/lib/trade-calculations";
import { CryptoAsset, fetchCryptoPrice, FiatCurrency, formatCurrency } from "@/lib/utils";
import { Quote, useQuoteStore } from "@/hooks/use-quote";
import { nanoid } from "nanoid";
import { useAuth } from "@/context/AuthContext";
import { useBalances } from "@/hooks/use-balances";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { CryptoBalance, FiatBalance } from "@/lib/types/db";
import React from "react";
import { ClientOnly } from "@/components/ClientOnly";

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
  return (
    <ClientOnly fallback={
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex justify-between">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
          </div>
        </CardContent>
      </Card>
    }>
      <BuySellCardContent />
    </ClientOnly>
  );
}

export function BuySellCardContent() {
  const { user } = useAuth();
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const { toast } = useToast();
  const [tradeResult, setTradeResult] = useState<TradeResult | null>(null);

  // Get balances with proper loading states
  const { fiatBalances, cryptoBalances, isFiatLoading, isCryptoLoading, isLoading } = useBalances();

  // Initialize form with empty defaults first
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: fiatBalances[0]?.currency || "",
      crypto: cryptoBalances[0]?.cryptoType || "",
      quantity: "",
      amount: "",
    },
  });

  // Update form values when data is loaded - only once when balances are first loaded
  const initialValuesSetRef = React.useRef(false);
  
  useEffect(() => {
    // Only set values if we haven't set them yet and balances are loaded
    if (!initialValuesSetRef.current && !isLoading) {
      if (fiatBalances?.length > 0) {
        const currentCurrency = form.getValues("currency");
        if (!currentCurrency) {
          form.setValue("currency", fiatBalances[0]?.currency || "");
        }
      }
      
      if (cryptoBalances?.length > 0) {
        const currentCrypto = form.getValues("crypto");
        if (!currentCrypto) {
          form.setValue("crypto", cryptoBalances[0]?.cryptoType || "");
        }
      }
      
      initialValuesSetRef.current = true;
    }
  }, [fiatBalances, cryptoBalances, isLoading]);

  // Find selected currency and crypto with null checks
  const selectedCurrency = form.watch("currency") 
    ? fiatBalances?.find((currency: FiatBalance) => currency.currency === form.watch("currency"))
    : undefined;

  const selectedCrypto = form.watch("crypto")
    ? cryptoBalances?.find((crypto: CryptoBalance) => crypto.cryptoType === form.watch("crypto"))
    : undefined;

    const { data: currentPrice, isLoading: priceLoading, isError: priceError } = useQuery({
      queryKey: ["crypto-price", selectedCrypto?.cryptoType, selectedCurrency?.currency],
      queryFn: () => fetchCryptoPrice(selectedCrypto?.cryptoType as CryptoAsset, selectedCurrency?.currency as FiatCurrency),
      refetchInterval: 1000,
    });
  

  const handleInputChange = (field: "quantity" | "amount", value: string) => {
    form.setValue(field, value);
    form.setValue(field === "quantity" ? "amount" : "quantity", "");

    if (!selectedCurrency || !selectedCrypto) return;

    const result = calculateTrade({
      tradeType,
      [field]: value,
      currentPrice: currentPrice?.priceUSD,
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
          ? `Insufficient ${selectedCurrency?.currency} balance. Required: ${formatCurrency(required, selectedCurrency?.currency || "")}, Available: ${formatCurrency(available, selectedCurrency?.currency || "")}`
          : `Insufficient ${selectedCrypto?.cryptoType} balance. Required: ${required.toFixed(8)} ${selectedCrypto?.cryptoType}, Available: ${available.toFixed(8)} ${selectedCrypto?.cryptoType}`,
        variant: "destructive",
      });
    }
  };

  const handleRequestQuote = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      return toast({
        title: "Authentication required",
        description: "Please sign in to request a quote",
        variant: "destructive",
      });
    }

    if (!selectedCurrency || !selectedCrypto) {
      return toast({
        title: "Selection Error",
        description: "Please select a currency and crypto",
        variant: "destructive",
      });
    }

    const result = calculateTrade({
      tradeType,
      quantity: values.quantity,
      amount: values.amount,
      currentPrice: currentPrice?.priceUSD,
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
          ? `Insufficient ${selectedCurrency?.currency} balance. Required: ${formatCurrency(required, selectedCurrency?.currency || "")}, Available: ${formatCurrency(available, selectedCurrency?.currency || "")}`
          : `Insufficient ${selectedCrypto?.cryptoType} balance. Required: ${required.toFixed(8)} ${selectedCrypto?.cryptoType}, Available: ${available.toFixed(8)} ${selectedCrypto?.cryptoType}`,
        variant: "destructive",
      });
    }

    const quote: Quote = {
      id: nanoid(),
      currency: values.currency,
      crypto: values.crypto,
      tradeType,
      currentPrice: currentPrice?.priceUSD,
      calculatedAmount: result.calculatedAmount,
      calculatedQuantity: result.calculatedQuantity,
      netAmount: result.netAmount,
      amount: parseFloat(values.amount || "0"),
      quoteRate: currentPrice?.priceUSD,
      status: "ACTIVE",
      expiresAt: Date.now() + 15000, // 15 seconds
    };

    useQuoteStore.getState().addQuote(quote);

    toast({
      title: "Quote Created",
      description: `${tradeType} quote created successfully`,
    });
  };

  // Render loading state if data is still loading
  if (isLoading) {
    return (
      <Card className="w-full h-auto">
        <CardContent className="p-4 flex justify-center items-center h-40">
          <div className="text-center">
            <p className="mb-2">Loading balances...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-auto">
      <CardContent className="p-4">
        {!user ? (
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
                          disabled={isFiatLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {fiatBalances?.map((currency: FiatBalance) => (
                              <SelectItem key={currency.id} value={currency.currency}>
                                {currency.currency}
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
                          disabled={isCryptoLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Crypto" />
                          </SelectTrigger>
                          <SelectContent>
                            {cryptoBalances?.map((crypto: CryptoBalance) => (
                              <SelectItem key={crypto.id} value={crypto.cryptoType}>
                                {crypto.cryptoType}
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

                <Button 
                  type="submit" 
                  className="h-10"
                  disabled={!selectedCurrency || !selectedCrypto}
                >
                  Request Quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {tradeResult && !tradeResult.error && (
                <div className="mt-4 space-y-2 p-4 border rounded-lg bg-muted/50">
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="font-medium">
                      {tradeResult.calculatedQuantity.toFixed(8)} {selectedCrypto?.cryptoType}
                    </span>
                  </div>

                  <div className="flex justify-between font-bold">
                    <span>Net {tradeType === "BUY" ? "Cost" : "Proceeds"}:</span>
                    <span className={tradeResult.insufficientBalance ? "text-destructive" : ""}>
                      {formatCurrency(tradeResult.netAmount, selectedCurrency?.currency || "")}
                    </span>
                  </div>
                  {tradeResult.insufficientBalance && (
                    <div className="mt-2 p-2 border border-destructive rounded text-destructive text-sm">
                      {tradeResult.insufficientBalance.type === "FIAT"
                        ? `Insufficient ${selectedCurrency?.currency} balance`
                        : `Insufficient ${selectedCrypto?.cryptoType} balance`}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                {selectedCurrency && (
                  <p className="mt-2 text-md font-bold text-muted-foreground">
                    Available {selectedCurrency.currency}: {formatCurrency(selectedCurrency.balance, selectedCurrency.currency)}
                  </p>
                )}
                {selectedCrypto && (
                  <p className="mt-2 text-md font-bold text-muted-foreground">
                    Available {selectedCrypto.cryptoType}: {selectedCrypto.balance.toFixed(8)} {selectedCrypto.cryptoType}
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
                  {formatCurrency(currentPrice?.priceUSD || 0, selectedCrypto?.cryptoType || "")} {selectedCrypto?.cryptoType}/{selectedCurrency?.currency}
                </div>
              )}
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
