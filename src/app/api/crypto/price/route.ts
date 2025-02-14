import { NextResponse } from "next/server";
import axios from "axios";

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const CRYPTO_ID_MAP = {
  btc: "bitcoin",
  eth: "ethereum",
  usdc: "usd-coin",
  usdt: "tether",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const crypto = searchParams.get("crypto")?.toLowerCase();
    const currency = searchParams.get("currency")?.toLowerCase();

    if (!crypto || !currency) {
      return NextResponse.json(
        { error: "Missing crypto or currency parameter" },
        { status: 400 }
      );
    }

    const cryptoId = CRYPTO_ID_MAP[crypto as keyof typeof CRYPTO_ID_MAP];
    if (!cryptoId) {
      return NextResponse.json(
        { error: "Unsupported cryptocurrency" },
        { status: 400 }
      );
    }

    const response = await axios.get(
      `${COINGECKO_API}/simple/price`,
      {
        params: {
          ids: cryptoId,
          vs_currencies: currency,
        },
        headers: {
          'Accept': 'application/json',
        },
        timeout: 5000,
      }
    );

    const price = response.data[cryptoId][currency];

    return NextResponse.json({
      price,
      currency: currency.toUpperCase(),
    });
  } catch (error) {
    console.error("Error fetching crypto price:", error);
    return NextResponse.json(
      { error: "Failed to fetch crypto price" },
      { status: 500 }
    );
  }
}
