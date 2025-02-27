"use server";

import { auth } from "../../auth";
import db from "../db";
import { cryptoCurrencySchema, currencySchema } from "../validations/balance";
import { revalidatePath } from "next/cache";

export async function getFiatBalances() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const balances = await db.fiatBalance.findMany({
      where: {
        userId: session.user.id,
      },
    });

    return balances;
  } catch (error) {
    throw new Error("Failed to fetch fiat balances");
  }
}

export async function getFiatBalance(currency: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    const validCurrency = currencySchema.parse(currency.toUpperCase());
    
    const balance = await db.fiatBalance.findFirst({
      where: { 
        userId: session.user.id,
        currency: validCurrency
      }
    });

    revalidatePath(`/balances/${currency.toLowerCase()}`);
    return balance;
  } catch (error) {
    throw new Error(`Failed to fetch ${currency} balance`);
  }
} 

export async function getCryptoBalances() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const balances = await db.cryptoBalance.findMany({
      where: {
        userId: session.user.id,
      },
    });

    return balances;
  } catch (error) {
    throw new Error("Failed to fetch crypto balances");
  }
}

export async function getCryptoBalance(currency: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validCurrency = cryptoCurrencySchema.parse(currency.toUpperCase());

    const wallet = await db.cryptoBalance.findFirst({
      where: {
        userId: session.user.id,
        cryptoType: validCurrency,
      },
    });

    revalidatePath(`/wallets/${currency.toLowerCase()}`);
    return wallet;
  } catch (error) { 
    throw new Error(`Failed to fetch ${currency} wallet`);
  }
}


