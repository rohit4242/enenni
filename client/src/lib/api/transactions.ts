import { CryptoType } from "@/types";
import apiClient from "./client";
import { TransactionType } from "../schemas/transaction";

export const getTransactionsBySpecificCryptoType = async (cryptoId: string) => {
    const response = await apiClient.get(`/transactions/crypto/${cryptoId}`);
    return response.data;
};

export const getTransactionsBySpecificCurrency = async (currency: string) => {
    const response = await apiClient.get(`/transactions/currency/${currency}`);
    return response.data;
};

export const createFiatBalanceTransaction = async (data: {
    userId: string;
    amount: number;
    currency: string;
    transactionType: TransactionType;
    accountId: string;
    description?: string;
}) => {
    const response = await apiClient.post(`/fiat-balances/transaction/${data.currency}`, data);
    return response.data;
};

export const createCryptoBalanceTransaction = async (data: {
    userId: string;
    cryptoType: CryptoType;
    amount: number;
    walletAddress: string;
    network: string;
    transactionType: TransactionType;
    description?: string;
}) => { 
    console.log("data: ",data);
    const response = await apiClient.post(`/crypto-balances/transaction/${data.cryptoType}`, data);
    console.log("response: ",response.data);
    return response.data;
};

