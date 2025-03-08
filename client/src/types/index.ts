// src/types/index.ts
export type Transaction = {
    amount: number;
    currency: string;
    dateTime: string;
    transactionHash: string;
    destination: string;
    status: "COMPLETED" | "PENDING" | "FAILED";
  }
  
  export type SortDirection = {
    amount: "asc" | "desc";
    dateTime: "asc" | "desc";
    status: "asc" | "desc";
  }

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

export type CryptoType = "BTC" | "ETH" | "USDT" | "USDC";

export type CryptoBalance = {
    id: string;
    userId: string;
    cryptoType: CryptoType;
    balance: number;
    walletAddress: string;
}

export type FiatBalance = {
    id: string;
    userId: string;
    currency: string;
    balance: number;
}

export type CurrencyType = "USD" | "AED";

export type UserBankAccount = {
    id: string;
    userId: string;
    accountHolderName: string;
    accountNumber: string;
    iban: string;
    bankName: string;
    accountCurrency: CurrencyType;
    bankAddress: string;
    bankCountry: string;
    proofDocumentUrl: string;
    status: TransactionStatus;
    createdAt: string;
    updatedAt: string;
}

