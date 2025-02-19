export const FIAT_CURRENCIES = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "AED", label: "UAE Dirham (AED)" },
] as const;

export const CRYPTO_ASSETS = [
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "USDT", label: "Tether (USDT)" },
  { value: "USDC", label: "USD Coin (USDC)" },
] as const;

export const CRYPTO_NETWORKS = {
  BTC: ["Tron", "Ethereum"],
  ETH: ["Tron", "Ethereum"],
  USDT: ["Tron", "Ethereum"],
  USDC: ["Tron", "Ethereum"],
} as const;

export const CRYPTO_ICONS = {
  USDT: "💎",
  BTC: "₿",
  ETH: "Ξ",
  USDC: "$",
} as const;

// All pairs are valid with LiveCoinWatch
export const VALID_PAIRS = CRYPTO_ASSETS.flatMap((crypto) =>
  FIAT_CURRENCIES.map((fiat) => `${crypto.value}${fiat.value}`)
) as readonly string[];
