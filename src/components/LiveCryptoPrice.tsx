"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CRYPTO_ASSETS, FIAT_CURRENCIES, VALID_PAIRS } from "@/lib/constants/trading";
import TradingViewPrice from "@/components/TradingViewPrice";

const QUOTE_CURRENCIES = [
  { value: "AED", label: "UAE Dirham (AED)" },
  { value: "USD", label: "US Dollar (USD)" },
];

export function LiveCryptoPrice() {
  const [baseAsset, setBaseAsset] = useState(CRYPTO_ASSETS[0].value);
  const [quoteAsset, setQuoteAsset] = useState(FIAT_CURRENCIES[0].value);

  const symbol = `${baseAsset}${quoteAsset}`;
  const isValidPair = VALID_PAIRS.includes(symbol as any);

  // Compute the TradingView symbol.
  // (Using BINANCE:{BASE}USDT for all cases since TradingView lacks AED pairs.)
  const tradingSymbol = `BINANCE:${baseAsset.toUpperCase()}USDT`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Crypto Price</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex gap-4">
            <Select value={baseAsset} onValueChange={(value: string) => setBaseAsset(value as any)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select Crypto" />
              </SelectTrigger>
              <SelectContent>
                {CRYPTO_ASSETS.map((crypto) => (
                  <SelectItem key={crypto.value} value={crypto.value}>
                    {crypto.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={quoteAsset} onValueChange={(value: string) => setQuoteAsset(value as any)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                {QUOTE_CURRENCIES.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isValidPair ? (
            <div className="text-3xl font-bold">
              <TradingViewPrice symbol={tradingSymbol} />
            </div>
          ) : (
            <Skeleton className="h-10 w-32" />
          )}
        </div>
      </CardContent>
    </Card>
  );
} 