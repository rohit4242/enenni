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

const cryptoPairs = [
  { value: "BTCUSDT", label: "Bitcoin (BTC/USDT)" },
  { value: "ETHUSDT", label: "Ethereum (ETH/USDT)" },
  { value: "BNBUSDT", label: "Binance Coin (BNB/USDT)" },
]

const chartTypes = [
  { value: "area", label: "Line Chart" },
  { value: "bar", label: "Bar Chart" },
]

export function LiveChart() {
  const [timeRange, setTimeRange] = React.useState("1h")
  const [cryptoPair, setCryptoPair] = React.useState("BTCUSDT")
  const [chartData, setChartData] = React.useState([])
  const [chartType, setChartType] = React.useState<"area" | "bar">("area")

  const fetchData = React.useCallback(async () => {
    const interval = timeRange === "1h" ? "1m" : timeRange === "1d" ? "15m" : "1h"
    const limit = timeRange === "1h" ? 60 : timeRange === "1d" ? 96 : 168
    const url = `https://api.binance.com/api/v3/klines?symbol=${cryptoPair}&interval=${interval}&limit=${limit}`

    try {
      const response = await fetch(url)
      const data = await response.json()
      const formattedData = data.map((item: any) => ({
        time: new Date(item[0]).toISOString(),
        price: Number.parseFloat(item[4]),
      }))
      setChartData(formattedData)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }, [cryptoPair, timeRange])

  React.useEffect(() => {
    fetchData()
    const intervalId = setInterval(fetchData, 1000)
    return () => clearInterval(intervalId)
  }, [fetchData])

  const renderChart = () => {
    const ChartComponent = chartType === "area" ? AreaChart : BarChart
    const DataComponent = chartType === "area" ? Area : Bar

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
            const date = new Date(value)
            return date.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
            })
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={["auto", "auto"]}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
          width={80}
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
                })
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
        <Select value={cryptoPair} onValueChange={setCryptoPair}>
          <SelectTrigger className="w-[180px] rounded-lg sm:ml-auto" aria-label="Select a cryptocurrency">
            <SelectValue placeholder="Select crypto" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {cryptoPairs.map((pair) => (
              <SelectItem key={pair.value} value={pair.value} className="rounded-lg">
                {pair.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
       
        </div>
       

      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full" style={{ marginLeft: "-20px" }}>
          {renderChart()}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

