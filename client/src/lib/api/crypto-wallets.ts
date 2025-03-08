import apiClient from "./client";
import { NewWalletFormValues } from "../schemas/wallet";

export const getCryptoWallets = async () => {
  const response = await apiClient.get("/crypto-wallets");
  return response.data;
};

export const createCryptoWallet = async (cryptoWallet: NewWalletFormValues) => {
  const response = await apiClient.post("/crypto-wallets", cryptoWallet);
  return {
    status: response.status,
    error: response.data.error,
    data: response.data,
  };
};

export const updateCryptoWallet = async (cryptoWallet: NewWalletFormValues) => {
  const response = await apiClient.put("/crypto-wallets", cryptoWallet);
  return response.data;
};
