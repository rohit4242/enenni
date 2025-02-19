"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { CRYPTO_ASSETS, FIAT_CURRENCIES, VALID_PAIRS } from "@/lib/constants/trading"
import TradingViewChart from "@/components/TradingViewChart"
import TradingViewPrice from "@/components/TradingViewPrice"

const timeRanges = [
  { value: "1h", label: "1 Hour" },
  { value: "1d", label: "1 Day" },
  { value: "1w", label: "1 Week" },
]

const getTradingViewSymbol = (baseAsset: string, quoteAsset: string) => {
  // For stablecoins, use special handling
  if (baseAsset === "USDT" || baseAsset === "USDC") {
    return quoteAsset === "AED" ? "USDAED" : "USDUSDT";
  }
  
  // For other crypto, use Binance pairs
  return `BINANCE:${baseAsset}USDT`;
}

export function LiveChart() {
  const [timeRange, setTimeRange] = useState("1h")
  const [baseAsset, setBaseAsset] = useState(CRYPTO_ASSETS[0].value)
  const [quoteAsset, setQuoteAsset] = useState(FIAT_CURRENCIES[0].value)

  const symbol = `${baseAsset}${quoteAsset}`
  const isValidPair = VALID_PAIRS.includes(symbol as any)
  const tradingSymbol = getTradingViewSymbol(baseAsset, quoteAsset)

  if (!isValidPair) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
          <CardDescription>Trading pair not available</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The selected trading pair {symbol} is not available.
              Please select a different combination.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Price Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                {FIAT_CURRENCIES.map((fiat) => (
                  <SelectItem key={fiat.value} value={fiat.value}>
                    {fiat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-3xl font-bold py-2">
            <TradingViewPrice symbol={tradingSymbol} />
          </div>

          <div className="h-[600px] w-full">
            <TradingViewChart 
              symbol={tradingSymbol}
              timeRange={timeRange}
              currency={quoteAsset}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

