import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import https from "https";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Create an HTTPS agent with keep-alive enabled
const httpsAgent = new https.Agent({ 
  keepAlive: true,
  timeout: 5000 // 5 seconds timeout
});

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<any> {
  try {
    const response = await axios.get(url, {
      timeout: 5000, // 5 seconds timeout
      httpsAgent,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MyApp/1.0)",
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data. Retries left: ${retries}`, error);
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

// Optimized bar mapping for better real-time data
const barMapping: Record<string, string> = {
  "1h": "1m",    // 1 minute candles for 1 hour view
  "1d": "5m",    // 5 minute candles for 1 day view
  "1w": "15m",   // 15 minute candles for 1 week view
};

// Adjusted limits for smoother charts
const limitMapping: Record<string, number> = {
  "1h": 60,    // 60 one-minute candles
  "1d": 288,   // 288 five-minute candles
  "1w": 672,   // 672 fifteen-minute candles
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const timeRange = searchParams.get("timeRange") || "1h";

  if (!symbol) {
    return NextResponse.json(
      { error: "Missing symbol parameter" },
      { status: 400 }
    );
  }

  try {
    const [baseAsset, quoteAsset] = symbol.split("-");
    const formattedSymbol = `${baseAsset}-${quoteAsset}`;
    
    const bar = barMapping[timeRange] || "1m";
    const limit = limitMapping[timeRange] || 60;
    
    try {
      const indexData = await fetchWithRetry(
        `https://www.okx.com/api/v5/market/index-candles?instId=${formattedSymbol}&bar=${bar}&limit=${limit}`
      );

      if (indexData.data && indexData.data.length > 0) {
        const chartData = indexData.data.map((candle: string[]) => {
          // OKX index candle format: [timestamp, open, high, low, close]
          const timestamp = new Date(parseInt(candle[0])).toISOString();
          const closePrice = parseFloat(candle[4]); // Using close price
          
          return {
            time: timestamp,
            price: closePrice
          };
        });

        // Sort by timestamp (ascending)
        chartData.sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());

        return NextResponse.json({
          symbol: formattedSymbol,
          timeRange,
          data: chartData,
          lastUpdate: new Date().toISOString(),
          dataType: 'index'
        });
      }
    } catch (indexError) {
      console.log("Index candlesticks not available, trying mark price candles...");
    }

    // If index candlesticks fail, try mark price candles
    try {
      const markPriceData = await fetchWithRetry(
        `https://www.okx.com/api/v5/market/mark-price-candles?instId=${formattedSymbol}-SWAP&bar=${bar}&limit=${limit}`
      );

      if (markPriceData.data && markPriceData.data.length > 0) {
        const chartData = markPriceData.data.map((candle: string[]) => {
          // OKX mark price candle format: [timestamp, open, high, low, close]
          const timestamp = new Date(parseInt(candle[0])).toISOString();
          const closePrice = parseFloat(candle[4]); // Using close price
          
          return {
            time: timestamp,
            price: closePrice
          };
        });

        // Sort by timestamp (ascending)
        chartData.sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());

        return NextResponse.json({
          symbol: formattedSymbol,
          timeRange,
          data: chartData,
          lastUpdate: new Date().toISOString(),
          dataType: 'mark'
        });
      }
    } catch (markError) {
      console.log("Mark price candles not available, trying regular candles...");
    }

    // If both above fail, fall back to regular candles
    const regularData = await fetchWithRetry(
      `https://www.okx.com/api/v5/market/candles?instId=${formattedSymbol}&bar=${bar}&limit=${limit}`
    );

    if (!regularData.data || regularData.data.length === 0) {
      throw new Error("No chart data available from any OKX endpoint");
    }
    
    const chartData = regularData.data.map((candle: string[]) => {
      // OKX regular candle format: [timestamp, open, high, low, close, volume, ...]
      const timestamp = new Date(parseInt(candle[0])).toISOString();
      const closePrice = parseFloat(candle[4]); // Using close price
      
      return {
        time: timestamp,
        price: closePrice
      };
    });

    // Sort by timestamp (ascending)
    chartData.sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return NextResponse.json({
      symbol: formattedSymbol,
      timeRange,
      data: chartData,
      lastUpdate: new Date().toISOString(),
      dataType: 'regular'
    });

  } catch (error) {
    console.error("Error fetching chart data from OKX:", error);
    const errorMessage =
      error instanceof AxiosError
        ? error.message
        : error instanceof Error
        ? error.message
        : "Unknown error";

    return NextResponse.json(
      {
        error: "Error fetching chart data from OKX",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
} 