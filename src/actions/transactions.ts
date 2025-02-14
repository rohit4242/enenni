"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import {
  CryptoType,
  CurrencyType,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";
import { generateReferenceId } from "@/lib/utils";

// Base transaction interface
interface BaseTransactionData {
  amount: string;
  type: TransactionType;
  description?: string;
  memo?: string;
}

// Fiat specific transaction interface
interface FiatTransactionData extends BaseTransactionData {
  type: "FIAT_DEPOSIT" | "FIAT_WITHDRAWAL";
  currency: CurrencyType;
  bankAccountId: string;
}

// Crypto specific transaction interface
interface CryptoTransactionData extends BaseTransactionData {
  type: "CRYPTO_DEPOSIT" | "CRYPTO_WITHDRAWAL";
  cryptoType: CryptoType;
  walletAddress: string;
  network: string;
}

// Type guard to check if transaction is fiat
function isFiatTransaction(
  data: FiatTransactionData | CryptoTransactionData
): data is FiatTransactionData {
  return data.type.includes("FIAT");
}

export async function createTransaction(
  data: FiatTransactionData | CryptoTransactionData
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const transaction = await db.$transaction(async (tx) => {
      // Get the balance record without updating it
      let fiatBalanceId: string | null = null;
      let cryptoBalanceId: string | null = null;

      if (isFiatTransaction(data)) {
        const fiatBalance = await tx.fiatBalance.findUnique({
          where: {
            userId_currency: {
              userId,
              currency: data.currency,
            },
          },
        });
        fiatBalanceId = fiatBalance?.id || null;
      } else {
        const cryptoBalance = await tx.cryptoBalance.findUnique({
          where: {
            userId_cryptoType: {
              userId,
              cryptoType: data.cryptoType,
            },
          },
        });
        cryptoBalanceId = cryptoBalance?.id || null;
      }

      // Create the transaction with the balance ID
      const newTransaction = await tx.transaction.create({
        data: isFiatTransaction(data)
          ? {
              userId,
              type: data.type,
              status: TransactionStatus.PENDING,
              description: data.description,
              referenceId: generateReferenceId({ prefix: "FIAT", length: 8 }),
              fiatAmount: amount,
              fiatCurrency: data.currency,
              fiatBalanceId, // Link to fiat balance
              transactionHash: `${data.currency}_${Date.now()}`,
            }
          : {
              userId,
              type: data.type,
              status: TransactionStatus.PENDING,
              description: data.description,
              referenceId: generateReferenceId({ prefix: "CRY", length: 8 }),
              cryptoAmount: amount,
              cryptoType: data.cryptoType,
              cryptoBalanceId, // Link to crypto balance
              transactionHash: `${data.cryptoType}_${Date.now()}`,
            }
      });

      return newTransaction;
    });

    return { transaction };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Transaction error:", errorMessage);
    return { error: errorMessage };
  }
}
