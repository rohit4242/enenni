import apiClient from "./client";

export const getEnenniBankAccounts = async () => {
  const response = await apiClient.get("/enenni-bank-accounts");
  return response.data;
};

export const getEnenniBankAccount = async (id: string) => {
  const response = await apiClient.get(`/enenni-bank-accounts/${id}`);
  return response.data;
};



