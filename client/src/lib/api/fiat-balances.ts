import { FiatBalance } from "../types/db";
import apiClient from "./client";

export const getFiatBalances = async () => {
  const response = await apiClient.get("/fiat-balances/my");
  return response.data;
};

export const getFiatBalanceByCurrency = async (currency: string) => {
  const response = await apiClient.get(`/fiat-balances/my/${currency}`);
  return response.data;
};

export const createFiatBalance = async (fiatBalance: FiatBalance) => {
  const response = await apiClient.post("/fiat-balances/create", fiatBalance);
  return response.data;
};



