import { toast } from "@/hooks/use-toast";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  if (currencyCode === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } else if (currencyCode === "AED") {
    return new Intl.NumberFormat("ar-AE", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return amount.toString(); // Fallback for unsupported currencies
}

export const handleCopyAddress = async (text: string, message: string, title: string) => {
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