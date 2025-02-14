import { useQuery } from "@tanstack/react-query";
import { fetchPrice, CryptoPrice } from "@/lib/services/price-fetcher";

export function useLiveCryptoPrice(baseAsset: string, quoteAsset: string) {
  return useQuery<CryptoPrice>({
    queryKey: ["crypto-price", baseAsset, quoteAsset],
    queryFn: () => fetchPrice(baseAsset, quoteAsset),
    refetchInterval: 1000, // LiveCoinWatch recommends 15s intervals
    staleTime: 500,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
} 