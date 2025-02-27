"use client";

import { useQuery } from "@tanstack/react-query";
import { CurrencyType } from "@prisma/client";

export function useCompanyBankAccount(currency: CurrencyType) {
  return useQuery({
    queryKey: ["company-bank-account", currency],
    queryFn: async () => {
      const response = await fetch(`/api/bank-accounts/company?currency=${currency}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company bank account");
      }
      return response.json();
    },
  });
} 