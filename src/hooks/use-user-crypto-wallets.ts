import { useEffect, useState } from "react";
import { UserCryptoWallet } from "@prisma/client";

interface UseUserCryptoWalletsReturn {
  wallets: UserCryptoWallet[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserCryptoWallets(): UseUserCryptoWalletsReturn {
  const [wallets, setWallets] = useState<UserCryptoWallet[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/crypto-wallets");
      const data = await response.json();
      setWallets(data);
    } catch (err) {
      setError("Failed to fetch crypto wallets");
      console.error("Error fetching crypto wallets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  return {
    wallets,
    isLoading,
    error,
    refetch: fetchWallets,
  };
} 