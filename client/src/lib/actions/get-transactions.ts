import { auth } from "../../auth";
import { CryptoType, CurrencyType } from "@prisma/client";

export async function getTransactions(type: "fiat" | "crypto", currency: string) {
    try {
      const session = await auth();
      if (!session?.user?.id) throw new Error("Unauthorized");
  
      const transactions = await db.transaction.findMany({
        where: {
          userId: session.user.id,
          ...(type === "fiat" 
            ? { 
                fiatCurrency: currency as CurrencyType,
                type: {
                  in: [TransactionType.FIAT_DEPOSIT, TransactionType.FIAT_WITHDRAWAL]
                }
              }
            : {
                cryptoType: currency as CryptoType,
                type: {
                  in: [TransactionType.CRYPTO_DEPOSIT, TransactionType.CRYPTO_WITHDRAWAL]
                }
              }
          ),
        },
        include: {
          fiatBalance: type === "fiat",
          cryptoBalance: type === "crypto",
        },
        orderBy: {
          createdAt: "desc",
        },
      });
  
      return transactions;
    } catch (error) {
      console.error("[GET_TRANSACTIONS]", error);
      throw new Error("Failed to fetch transactions");
    }
  }
  