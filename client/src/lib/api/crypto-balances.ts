import { CryptoBalance } from "../types/db";
import apiClient from "./client";

export const getCryptoBalances = async () => {
  const response = await apiClient.get("/crypto-balances/my");
  return response.data;
};

export const getCryptoBalanceByCryptoType = async (cryptoType: string) => {
  const response = await apiClient.get(`/crypto-balances/my/${cryptoType}`);
  return response.data;
};

export const createCryptoBalance = async (cryptoBalance: CryptoBalance) => {
  const response = await apiClient.post("/crypto-balances/create", cryptoBalance);
  return response.data;
};



