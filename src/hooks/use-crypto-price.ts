import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

interface CryptoPriceResponse {
  price: number;
  currency: string;
}

export function useCryptoPrice(crypto: string, currency: string = "USD") {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const symbol = `${crypto}${currency}`.toUpperCase();
    wsRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Update the price in the cache
      queryClient.setQueryData(["crypto-price", crypto, currency], {
        price: parseFloat(data.p),
        currency: currency,
      });
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Cleanup WebSocket on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [crypto, currency, queryClient]);

  // Fallback REST API query in case WebSocket fails
  return useQuery<CryptoPriceResponse>({
    queryKey: ["crypto-price", crypto, currency],
    queryFn: async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${crypto}${currency}`.toUpperCase()
        );
        if (!response.ok) throw new Error("Failed to fetch price");
        const data = await response.json();
        return {
          price: parseFloat(data.price),
          currency: currency,
        };
      } catch (error) {
        throw new Error("Failed to fetch crypto price");
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000,
    refetchInterval: 2000, // Fallback refresh every 2 seconds if WebSocket fails
    refetchOnWindowFocus: true,
  });
}