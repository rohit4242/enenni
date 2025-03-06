import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import https from "https";

const MAX_RETRIES = 5;
const RETRY_DELAY = 1500; // 1.5 seconds

// Create an HTTPS agent with keep-alive enabled
const httpsAgent = new https.Agent({ keepAlive: true });

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<any> {
  try {
    const response = await axios.get(url, {
      timeout: 10000, // 10 seconds timeout
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
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

const barMapping: Record<string, string> = {
  "1h": "1m",  // 1 minute candles for 1 hour view
  "1d": "15m", // 15 minute candles for 1 day view
  "1w": "1H",  // 1 hour candles for 1 week view
};

const limitMapping: Record<string, number> = {
  "1h": 60,   // 60 points for 1 hour
  "1d": 96,   // 96 points for 1 day
  "1w": 168,  // 168 points for 1 week
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
    
    const data = await fetchWithRetry(
      `https://www.okx.com/api/v5/market/history-index-candles?instId=${formattedSymbol}&bar=${bar}&limit=${limit}`
    );

    if (!data.data || data.data.length === 0) {
      throw new Error("No chart data returned from OKX");
    }

    
    const chartData = data.data.map((candle: string[]) => {
      const timestamp = new Date(parseInt(candle[0])).toISOString();
      const closePrice = parseFloat(candle[4]);
            
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
      data: chartData
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