import { getFiatBalances } from "@/lib/api/fiat-balances";
import { getCryptoBalances } from "@/lib/api/crypto-balances";
import { useQuery } from "@tanstack/react-query";

export const useBalances = () => {
  const { data: fiatBalances = [], isLoading: isFiatLoading } = useQuery({
    queryKey: ["fiat-balances"],
    queryFn: async () => {
      const response = await getFiatBalances();
      return response.data || [];
    },
  });

  const { data: cryptoBalances = [], isLoading: isCryptoLoading } = useQuery({
    queryKey: ["crypto-balances"],
    queryFn: async () => {
      const response = await getCryptoBalances();
      return response.data || [];
    },
  });

  return {
    fiatBalances,
    isFiatLoading,
    cryptoBalances,
    isCryptoLoading,
    isLoading: isFiatLoading || isCryptoLoading
  };
};

