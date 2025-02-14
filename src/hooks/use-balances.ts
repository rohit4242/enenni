import { useState, useEffect } from 'react';

interface Balance {
  id: string;
  name: string;
  balance: number;
  type: 'FIAT' | 'CRYPTO';
}

export function useBalances() {
  const [fiatBalances, setFiatBalances] = useState<Balance[]>([]);
  const [cryptoBalances, setCryptoBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const [fiatResponse, cryptoResponse] = await Promise.all([
          fetch('/api/balances?type=fiat'),
          fetch('/api/balances?type=crypto')
        ]);

        const fiatData = await fiatResponse.json();
        const cryptoData = await cryptoResponse.json();

        setFiatBalances(fiatData.map((fiat: any) => ({
          id: fiat.currency,
          name: `${getFiatName(fiat.currency)} (${fiat.currency})`,
          balance: fiat.balance,
          type: 'FIAT' as const
        })));

        setCryptoBalances(cryptoData.map((crypto: any) => ({
          id: crypto.cryptoType,
          name: `${getCryptoName(crypto.cryptoType)} (${crypto.cryptoType})`,
          balance: crypto.balance,
          type: 'CRYPTO' as const
        })));
      } catch (error) {
        console.error('Failed to fetch balances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  return { fiatBalances, cryptoBalances, loading };
}

function getCryptoName(symbol: string): string {
  const names: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    USDT: 'Tether',
    USDC: 'USD Coin'
  };
  return names[symbol] || symbol;
} 

function getFiatName(symbol: string): string {
  const names: Record<string, string> = {
    AED: 'United Arab Emirates Dirham',
    USD: 'United States Dollar'
  };
  return names[symbol] || symbol;
}
