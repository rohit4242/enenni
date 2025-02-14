"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { CryptoType, CurrencyType, TransactionType } from "@prisma/client";

export async function getTransactions(type: CryptoType | CurrencyType) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // Determine if the type is a crypto or currency
    const isCrypto = Object.values(CryptoType).includes(type as CryptoType);
    // Determine if the type is a crypto or currency
    const isCurrency = Object.values(CurrencyType).includes(
      type as CurrencyType
    );

    // Throw error only if type is neither crypto nor currency
    if (!isCrypto && !isCurrency) {
      throw new Error("Invalid type provided");
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId,
        ...(isCrypto
          ? { cryptoType: type as CryptoType }
          : { fiatCurrency: type as CurrencyType }),
        type: {
          in: [
            TransactionType.FIAT_DEPOSIT,
            TransactionType.FIAT_WITHDRAWAL,
            TransactionType.BUY_CRYPTO,
            TransactionType.SELL_CRYPTO,
            TransactionType.CRYPTO_DEPOSIT,
            TransactionType.CRYPTO_WITHDRAWAL,
          ],
        },
      },
      include: {
        fiatBalance: isCurrency,
        cryptoBalance: isCrypto,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("transactions: ", transactions);
    return transactions;
  } catch (error) {
    console.error("[GET_TRANSACTIONS]", error);
    throw error;
  }
}
