import { toast } from "../hooks/use-toast";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CRYPTO_ASSETS, FIAT_CURRENCIES } from "@/lib/constants/trading";
import currencyFormatter from "currency-formatter";

export type CryptoAsset = (typeof CRYPTO_ASSETS)[number]["value"];
export type FiatCurrency = (typeof FIAT_CURRENCIES)[number]["value"];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ReferenceIdProps {
  prefix: string;
  length: number;
}

export function generateReferenceId({
  prefix,
  length,
}: ReferenceIdProps): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random()
    .toString(36)
    .substring(2, length)
    .toUpperCase();
  return `${prefix}-${dateStr}-${randomStr}`;
}

export function formatCurrency(amount: number, currencyCode: string) {
  const symbols: Record<string, string> = {
    USD: "$",
    AED: "د.إ",
    BTC: "₿",
    ETH: "Ξ",
    USDT: "₮",
    USDC: "₵",
  };

  return currencyFormatter.format(amount, {
    code: currencyCode,
    format: "%s %v",
    symbol: symbols[currencyCode] || currencyCode,
    decimal: ".",
    thousand: ",",
  });
}

export const handleCopyAddress = async (
  text: string,
  message: string,
  title: string
) => {
  try {
    await navigator.clipboard.writeText(text);
    toast({
      title: title,
      description: message,
    });
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};

export async function fetchCryptoPrice(
  baseAsset: CryptoAsset,
  quoteAsset: FiatCurrency
) {
  const response = await fetch(
    `/api/crypto/price?symbol=${baseAsset}-${quoteAsset}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch price");
  }
  return response.json();
}

export const handleExportOrdersCSV = (table: any) => {
  const headers = [
    "Order #",
    "Date",
    "Type",
    "Asset",
    "Quantity",
    "Total",
    "Status",
  ];
  const csvData = table
    .getFilteredRowModel()
    .rows.map((row: any) => [
      row.original.referenceId,
      new Date(row.original.createdAt).toLocaleDateString(),
      row.original.type,
      row.original.asset,
      row.original.quantity.toString(),
      row.original.totalAmount.toString(),
      row.original.status,
    ]);

  const csvContent = [
    headers.join(","),
    ...csvData.map((row: string[]) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `orders_${new Date().toISOString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const getCallbackUrl = (defaultPath = "/dashboard") => {
  if (typeof window === "undefined") return defaultPath;
  
  const params = new URLSearchParams(window.location.search);
  return params.get("callbackUrl") || defaultPath;
}; 