import { useQuery } from "@tanstack/react-query";
// import { getBalance } from "@/actions/balances";
// import { getTransactions } from "@/actions/transactions";

export function useWalletData(type: "fiat" | "crypto", currency: string) {
  const { 
    data: balance, 
    isLoading: isBalanceLoading, 
    error: balanceError 
  } = useQuery({
    queryKey: ["balance", type, currency],
    // queryFn: () => getBalance(type, currency),
    staleTime: 30000,
    retry: 1,
  });

  const { 
    data: transactions, 
    isLoading: isTransactionsLoading,
    error: transactionsError
  } = useQuery({
    queryKey: ["transactions", type, currency],
    // queryFn: () => getTransactions(type, currency),
    staleTime: 30000,
    retry: 1,
  });

  return {
    balance,
    transactions,
    isLoading: isBalanceLoading || isTransactionsLoading,
    error: balanceError || transactionsError,
  };
}