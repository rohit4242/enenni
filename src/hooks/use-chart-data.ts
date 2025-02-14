import { useQuery } from "@tanstack/react-query";
import { fetchChartData } from "@/lib/services/price-fetcher";

export function useChartData(baseAsset: string, quoteAsset: string, timeRange: string) {
  return useQuery({
    queryKey: ["chart-data", baseAsset, quoteAsset, timeRange],
    queryFn: () => fetchChartData(baseAsset, quoteAsset, timeRange),
    refetchInterval: 1000,
    staleTime: 0,
    retry: 2,
    refetchOnWindowFocus: true,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
} 