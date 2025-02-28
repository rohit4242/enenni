import axios from 'axios';

// Modified fetchChartData function to use Binance API for realtime chart data.
// Also supports AED by converting USDT data to AED prices.
// In addition, if the selected crypto is Tether (USDT), we generate a constant chart
// since a USDTUSDT pair does not exist on Binance.
export async function fetchChartData(
  baseAsset: string, 
  quoteAsset: string, 
  interval: string
): Promise<{ time: string; price: number; }[]> {
  try {
    const end = Date.now();
    const range = getTimeRange(interval);
    const start = end - range;

    // Special-case: if the selected crypto is Tether, generate constant data.
    if (baseAsset.toUpperCase() === "USDT") {
      let constantPrice = 1;
      if (quoteAsset.toUpperCase() === "AED") {
        constantPrice = 3.67;
      }
      const numPoints = 30;
      const intervalMs = range / numPoints;
      const dataPoints = [];
      for (let i = 0; i < numPoints; i++) {
        dataPoints.push({
          time: new Date(start + i * intervalMs).toISOString(),
          price: constantPrice,
        });
      }
      return dataPoints;
    }

    const targetQuote = quoteAsset.toUpperCase();
    let mappedQuote: string;
    let conversionRate = 1;
    if (targetQuote === "USD") {
      mappedQuote = "USDT";
    } else if (targetQuote === "AED") {
      mappedQuote = "USDT";
      conversionRate = 3.67;
    } else {
      mappedQuote = targetQuote;
    }
    const symbol = baseAsset.toUpperCase() + mappedQuote;

    // Map our interval to Binance candlestick intervals.
    const intervalMapping: { [key: string]: string } = {
      "1h": "1m",
      "1d": "5m",
      "1w": "1h",
    };
    const binanceInterval = intervalMapping[interval] || "5m";

    const response = await axios.get("https://api.binance.com/api/v3/klines", {
      params: {
        symbol,
        interval: binanceInterval,
        startTime: start,
        endTime: end,
      },
      timeout: 5000,
    });

    const data = response.data as any[];

    // Binance returns each candlestick as an array.
    // We use the opening time (index 0) and the closing price (index 4),
    // multiplying the price by the conversion rate if needed.
    const chartData = data.map((kline) => ({
      time: new Date(kline[0]).toISOString(),
      price: parseFloat(kline[4]) * conversionRate,
    }));

    return chartData;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch chart data: ${error.message}`);
    }
    throw error;
  }
}

function getTimeRange(interval: string): number {
  switch (interval) {
    case '1h': return 60 * 60 * 1000;
    case '1d': return 24 * 60 * 60 * 1000;
    case '1w': return 7 * 24 * 60 * 60 * 1000;
    default: return 24 * 60 * 60 * 1000;
  }
}
