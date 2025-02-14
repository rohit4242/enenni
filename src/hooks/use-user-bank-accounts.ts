import { useEffect, useState } from "react";
import { UserBankAccount } from "@prisma/client";

interface UseUserBankAccountsReturn {
  bankAccounts: UserBankAccount[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserBankAccounts(): UseUserBankAccountsReturn {
  const [bankAccounts, setBankAccounts] = useState<UserBankAccount[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBankAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/bank-accounts");
      const data = await response.json();
      setBankAccounts(data);
    } catch (err) {
      setError("Failed to fetch bank accounts");
      console.error("Error fetching bank accounts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  return {
    bankAccounts,
    isLoading,
    error,
    refetch: fetchBankAccounts,
  };
} 