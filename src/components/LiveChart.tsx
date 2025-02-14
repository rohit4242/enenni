"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useChartData } from "@/hooks/use-chart-data"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { CRYPTO_ASSETS, FIAT_CURRENCIES } from "@/lib/constants/trading"

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const timeRanges = [
  { value: "1h", label: "1 Hour" },
  { value: "1d", label: "1 Day" },
  { value: "1w", label: "1 Week" },
]

const cryptoAssets = [
  { value: "BTC", label: "Bitcoin" },
  { value: "ETH", label: "Ethereum" },
  { value: "USDT", label: "Tether (USDT)" },
  { value: "USDC", label: "Circle (USDC)" },
]

const quoteAssets = [
  { value: "AED", label: "UAE Dirham (AED)" },
  { value: "USD", label: "US Dollar (USD)" },
]

export function LiveChart() {
  const [timeRange, setTimeRange] = React.useState("1h")
  const [baseAsset, setBaseAsset] = React.useState(CRYPTO_ASSETS[0].value)
  const [quoteAsset, setQuoteAsset] = React.useState(FIAT_CURRENCIES[0].value)
  const [chartType, setChartType] = React.useState<"area" | "bar">("area")

  const symbol = `${baseAsset}${quoteAsset}`
  const isValidPair = true // Assuming the pair is always valid

  const { data: chartData, isLoading, error } = useChartData(
    baseAsset,
    quoteAsset,
    timeRange
  )

  const formatPrice = (price: number) => {

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quoteAsset,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const renderChart = () => {
    if (isLoading) {
      return <Skeleton className="h-[250px] w-full" />
    }

    if (error || !chartData) {
      return <div className="flex h-[250px] items-center justify-center text-destructive">Failed to load chart data</div>
    }

    const ChartComponent = chartType === "area" ? AreaChart : BarChart
    const DataComponent = chartType === "area" ? Area : Bar

    return (
      <ChartComponent
        data={chartData}
        margin={{ left: 12, right: 12 }}
      >
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeOpacity={0.2} />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value)
            return timeRange === "1h" 
              ? date.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })
              : date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={["auto", "auto"]}
          tickFormatter={(value) => formatPrice(value)}
          width={80}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })
              }}
            />
          }
        />
        <DataComponent
          type="monotone"
          dataKey="price"
          stroke="var(--color-price)"
          fill={chartType === "bar" ? "var(--color-price)" : "url(#gradient)"}
          strokeWidth={chartType === "bar" ? 0 : 2}
          isAnimationActive={false}
          radius={chartType === "bar" ? 4 : undefined}
        />
        <ChartLegend content={<ChartLegendContent />} />
      </ChartComponent>
    )
  }

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
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Price Chart</CardTitle>
          <CardDescription>Live price data from Binance</CardDescription>
        </div>
        <div className="flex justify-center items-center flex-wrap gap-2">
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
              {cryptoAssets.map((crypto) => (
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
              {quoteAssets.map((quote) => (
                <SelectItem key={quote.value} value={quote.value}>
                  {quote.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={chartType} onValueChange={(value: "area" | "bar") => setChartType(value)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Chart type" />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: "area", label: "Line Chart" },
                { value: "bar", label: "Bar Chart" },
              ].map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          {renderChart()}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

