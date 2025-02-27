import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Transaction,
  CurrencyType,
  CryptoType,
  CryptoBalance,
  FiatBalance,
} from "@prisma/client";

type TransactionWithCryptoBalance = Transaction & {
  cryptoBalance: CryptoBalance | null;
};

type TransactionWithCurrencyBalance = Transaction & {
  currencyBalance: FiatBalance | null;
};

export function useTransactions(currencyType: CurrencyType | CryptoType) {
  const queryClient = useQueryClient();

  const queryKey: [string, string] = ["transactions", currencyType];
  let queryFn: () => Promise<
    TransactionWithCryptoBalance[] | TransactionWithCurrencyBalance[]
  >;

  if (
    Object.values(CryptoType).includes(currencyType.toUpperCase() as CryptoType)
  ) {
    queryFn = async () => {
      const response = await fetch(`/api/transactions/crypto/${currencyType}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = (await response.json()) as TransactionWithCryptoBalance[];
      return data;
    };
  } else if (
    Object.values(CurrencyType).includes(currencyType as CurrencyType)
  ) {
    queryFn = async () => {
      const response = await fetch(
        `/api/transactions/currency/${currencyType}`
      );
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = (await response.json()) as TransactionWithCurrencyBalance[];
      return data;
    };
  } else {
    throw new Error("Invalid currency type");
  }

  queryClient.invalidateQueries({
    queryKey: ["transactions", currencyType],
  });

  const {
    data: transactions,
    isLoading,
    error,
  } = useQuery<
    TransactionWithCryptoBalance[] | TransactionWithCurrencyBalance[]
  >({ queryKey, queryFn });

  const balance = transactions && transactions.length > 0
    ? "cryptoBalance" in transactions[0]
      ? transactions[0].cryptoBalance?.balance ?? 0
      : "currencyBalance" in transactions[0]
      ? transactions[0].currencyBalance?.balance ?? 0
      : 0
    : 0;

  return {
    transactions,
    balance,
    isLoading,
    error,
  };
}
