import apiClient from "./client";

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await apiClient.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await apiClient.post("/auth/login", data);
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get("/auth/me");
  return response.data;
};

export const verifyEmail = async (code: string, email: string) => {
  const response = await apiClient.post("/auth/verify-email", { code, email });
  return response.data;
};

export const requestPasswordReset = async (email: string) => {
  const response = await apiClient.post("/auth/reset-password", { email });
  return response.data;
};

export const resetPassword = async (data: {
  token: string;
  password: string;
}) => {
  const response = await apiClient.post("/auth/new-password", data);
  return response.data;
};

export const verifyTwoFactor = async (data: {
  email: string;
  code: string;
}) => {
  const response = await apiClient.post("/auth/two-factor", data);
  return response.data;
};

export const resendVerificationEmail = async (email: string) => {
  const response = await apiClient.post("/auth/resend-verification", {email});
  return response.data;
};

