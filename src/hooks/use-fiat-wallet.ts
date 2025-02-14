import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiatBalance, Transaction } from "@prisma/client";

export interface FiatBalanceWithTransactions extends FiatBalance {
  transactions: Transaction[];
}

interface UseWalletReturn {
  wallet: FiatBalanceWithTransactions[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFiatWallet(
  currency: string
): UseWalletReturn {
  const validCurrencies = ["aed", "usd"];

  const queryClient = useQueryClient();

  const {
    data: wallets,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["fiatWallet", currency],
    queryFn: async () => {
      if (!validCurrencies.includes(currency.toLowerCase())) {
        throw new Error(`Invalid wallet type: ${currency.toUpperCase()}`);
      }

      const response = await fetch(`/api/balances?type=fiat`);
      if (!response.ok) {
        throw new Error("Failed to fetch wallet");
      }
      return response.json() as Promise<FiatBalanceWithTransactions[]>;
    },
    retry: false,
  });

  queryClient.invalidateQueries({
    queryKey: ["transactions", "fiat-balances", currency],
  });

  return {
    wallet: wallets || null,
    loading: isLoading,
    error: error ? error.message : null,
    refetch,
  };
}
