import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type QuoteStatus = "ACTIVE" | "ACCEPTED" | "EXPIRED";

export interface Quote {
  id: string;
  currency: string;
  crypto: string;
  tradeType: "BUY" | "SELL";
  currentPrice: number;
  calculatedAmount: number;
  calculatedQuantity: number;
  netAmount: number;
  amount: number;
  quoteRate: number;
  status: QuoteStatus;
  expiresAt: number; // timestamp in ms
}

interface QuoteStore {
  quotes: Quote[];
  addQuote: (quote: Quote) => void;
  acceptQuote: (id: string) => void;
  clearQuotes: () => void;
  updateExpiredQuotes: () => void;
  getQuote: (id: string) => Quote | undefined;
}

export const useQuoteStore = create<QuoteStore>()(
  persist(
    (set, get) => ({
      quotes: [],
      addQuote: (quote) =>
        set((state) => ({ quotes: [quote, ...state.quotes] })),
      acceptQuote: (id: string) =>
        set((state) => ({
          quotes: state.quotes.map((q) =>
            q.id === id ? { ...q, status: "ACCEPTED" } : q
          ),
        })),
      clearQuotes: () => set({ quotes: [] }),
      updateExpiredQuotes: () => {
        const now = Date.now();
        set((state) => ({
          quotes: state.quotes.map((q) =>
            q.status === "ACTIVE" && q.expiresAt <= now
              ? { ...q, status: "EXPIRED" }
              : q
          ),
        }));
      },
      getQuote: (id: string) => get().quotes.find((q) => q.id === id),
    }),
    {
      name: "quote-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
