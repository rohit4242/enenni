import apiClient from "./client";
import { NewBankAccountFormValues } from "../schemas/bank-account";
import { BankAccount } from "../types/bank-account";

export const getBankAccounts = async () => {
  const response = await apiClient.get("/external-bank-accounts");
  return response.data;
};

// Get a specific bank account by ID
export const getBankAccountById = async (accountId: string) => {
  const response = await apiClient.get(`/external-bank-accounts/${accountId}`);
  return response.data;
};

export const createBankAccount = async (
  bankAccountData: NewBankAccountFormValues
) => {
  const response = await apiClient.post(
    "/external-bank-accounts",
    bankAccountData
  );
  return { data: response.data, status: response.status, error: null };
};

export const updateBankAccount = async (
  accountId: string,
  bankAccount: BankAccount
) => {
  const response = await apiClient.put(
    `/external-bank-accounts/${accountId}`,
    bankAccount
  );
  return response.data;
};

export const deleteBankAccount = async (accountId: string) => {
  const response = await apiClient.delete(
    `/external-bank-accounts/${accountId}`
  );
  return response.data;
};
