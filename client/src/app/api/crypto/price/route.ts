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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "Missing symbol parameter" },
      { status: 400 }
    );
  }

  try {
    const [baseAsset, quoteAsset] = symbol.split("-");
    // Format the symbol according to OKX requirements
    const formattedSymbol = `${baseAsset}-${quoteAsset}-SWAP`;

    // Using the correct OKX API endpoint for mark price
    const data = await fetchWithRetry(
      `https://www.okx.com/api/v5/public/mark-price?instId=${formattedSymbol}`
    );

    if (!data.data || data.data.length === 0) {
      throw new Error("No data returned from OKX");
    }

    const markPrice = data.data[0];
    const priceUSD = parseFloat(markPrice.markPx);

    return NextResponse.json({
      symbol: formattedSymbol,
      priceUSD,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching price data from OKX:", error);
    
    // Try alternative endpoint if SWAP fails
    try {
      const [baseAsset, quoteAsset] = symbol.split("-");
      const formattedSymbol = `${baseAsset}-${quoteAsset}`;
      
      const data = await fetchWithRetry(
        `https://www.okx.com/api/v5/market/ticker?instId=${formattedSymbol}`
      );

      if (!data.data || data.data.length === 0) {
        throw new Error("No data returned from OKX");
      }

      const ticker = data.data[0];
      const priceUSD = parseFloat(ticker.last);

      return NextResponse.json({
        symbol: formattedSymbol,
        priceUSD,
        timestamp: new Date().toISOString()
      });
    } catch (secondError) {
      const errorMessage =
        error instanceof AxiosError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Unknown error";

      return NextResponse.json(
        {
          error: "Error fetching price data from OKX",
          details: errorMessage,
        },
        { status: 500 }
      );
    }
  }
}
