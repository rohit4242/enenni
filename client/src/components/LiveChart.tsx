"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useQuery } from "@tanstack/react-query"
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
import { Skeleton } from "@/components/ui/skeleton"
import { CRYPTO_ASSETS, FIAT_CURRENCIES } from "@/lib/constants/trading";
import { formatCurrency } from "@/lib/utils"

type CryptoAsset = typeof CRYPTO_ASSETS[number]['value'];
type FiatCurrency = typeof FIAT_CURRENCIES[number]['value'];

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
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "USDT", label: "Tether (USDT)" },
  { value: "USDC", label: "USD Coin (USDC)" },
]

const currencies = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "AED", label: "UAE Dirham (AED)" },
]

const chartTypes = [
  { value: "area", label: "Line Chart" },
  { value: "bar", label: "Bar Chart" },
]

interface ChartDataPoint {
  time: string;
  price: number;
}

// Fetch chart data - separate function for React Query
async function fetchChartData(baseAsset: string, quoteAsset: string, timeRange: string): Promise<ChartDataPoint[]> {
  const response = await fetch(
    `/api/crypto/chart?symbol=${baseAsset}-${quoteAsset}&timeRange=${timeRange}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.data;
}

async function fetchCryptoPrice(baseAsset: CryptoAsset, quoteAsset: FiatCurrency) {
  const response = await fetch(`/api/crypto/price?symbol=${baseAsset}-${quoteAsset}`);
  if (!response.ok) {
    throw new Error("Failed to fetch price");
  }
  return response.json();
}

export function LiveChart() {
  const [timeRange, setTimeRange] = React.useState("1h")
  const [baseAsset, setBaseAsset] = React.useState("BTC")
  const [quoteAsset, setQuoteAsset] = React.useState("USD")
  const [chartType, setChartType] = React.useState<"area" | "bar">("area")

  const {
    data: chartData = [],
    isLoading: isChartLoading,
    isError: isChartError,
    error: chartError
  } = useQuery({
    queryKey: ["chart-data", baseAsset, quoteAsset, timeRange],
    queryFn: () => fetchChartData(baseAsset, quoteAsset, timeRange),
    staleTime: 15000,
    refetchInterval: 15000,
    retry: 3,
    refetchOnWindowFocus: true,
    enabled: typeof window !== 'undefined',
    refetchOnMount: true,
  })

  const {
    data: livePrice,
    isLoading: isPriceLoading,
    isError: isPriceError
  } = useQuery({
    queryKey: ["live-price", baseAsset, quoteAsset],
    queryFn: () => fetchCryptoPrice(baseAsset as CryptoAsset, quoteAsset as FiatCurrency),
    staleTime: 15000,
    refetchInterval: 15000,
    retry: 3,
    refetchOnWindowFocus: true,
    enabled: typeof window !== 'undefined',
    refetchOnMount: true,
  })

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <Skeleton className="h-[220px] w-full" />
        </div>
      );
    }

    const ChartComponent = chartType === "area" ? AreaChart : BarChart;
    const DataComponent = chartType === "area" ? Area : Bar;

    return (
      <ChartComponent
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <defs>
          <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
            });
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={["auto", "auto"]}
          tickFormatter={(value) =>
            quoteAsset === "USD" ? formatCurrency(value, "USD") : formatCurrency(value, "AED")
          }
          width={90}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent

              labelFormatter={(value) => {
                return new Date(value).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                });
              }}
              formatter={(value) => {
                return <p className=" text-muted-foreground">  {`Price: ${formatCurrency(value as number, quoteAsset)}`}</p>
              }}
            />
          }

        />
        <DataComponent
          dataKey="price"
          type="monotone"
          fill={chartType === "bar" ? "var(--color-price)" : "url(#fillPrice)"}
          stroke="var(--color-price)"
          strokeWidth={chartType === "bar" ? 0 : 2}
          isAnimationActive={false}
          radius={chartType === "bar" ? 4 : undefined}


        />
        <ChartLegend content={<ChartLegendContent />} />
      </ChartComponent>
    );
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Price Chart</CardTitle>
          <CardDescription>
            {isPriceLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : isPriceError ? (
              <span className="text-red-500">Error loading price</span>
            ) : (
              "Live Price: " +
              formatCurrency(livePrice?.priceUSD || 0, quoteAsset)
            )}
          </CardDescription>
        </div>
        <div className="flex justify-center items-center flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px] rounded-lg sm:ml-auto" aria-label="Select a time range">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value} className="rounded-lg">
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={baseAsset} onValueChange={setBaseAsset}>
            <SelectTrigger className="w-[150px] rounded-lg sm:ml-auto" aria-label="Select a cryptocurrency">
              <SelectValue placeholder="Select crypto" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {cryptoAssets.map((crypto) => (
                <SelectItem key={crypto.value} value={crypto.value} className="rounded-lg">
                  {crypto.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={quoteAsset} onValueChange={setQuoteAsset}>
            <SelectTrigger className="w-[150px] rounded-lg sm:ml-auto" aria-label="Select a currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {currencies.map((currency) => (
                <SelectItem key={currency.value} value={currency.value} className="rounded-lg">
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={chartType} onValueChange={(value: "area" | "bar") => setChartType(value)}>
            <SelectTrigger className="w-[130px] rounded-lg sm:ml-auto" aria-label="Select chart type">
              <SelectValue placeholder="Chart type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {chartTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="rounded-lg">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full" style={{ marginLeft: "-20px" }}>
          {isChartLoading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-[220px] w-full" />
            </div>
          ) : isChartError ? (
            <div className="flex items-center justify-center h-full text-red-500">
              {chartError instanceof Error ? chartError.message : "Error loading chart data"}
            </div>
          ) : chartData.length > 0 ? (
            renderChart()
          ) : (
            <div className="flex items-center justify-center h-full">
              No data available
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
