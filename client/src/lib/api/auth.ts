import { AxiosError } from "axios";
import apiClient, { setAuthTokens } from "./client";

// Store tokens in memory for non-cookie clients
let accessToken: string | null = null;
let refreshTokenTimeout: NodeJS.Timeout | null = null;

// Helper to set the access token in memory and for API requests
const setAccessToken = (token: string) => {
  accessToken = token;
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// Helper to clear tokens
const clearTokens = () => {
  accessToken = null;
  if (refreshTokenTimeout) {
    clearTimeout(refreshTokenTimeout);
    refreshTokenTimeout = null;
  }
  delete apiClient.defaults.headers.common["Authorization"];
};

// Setup token refresh mechanism
const setupRefreshToken = (expiresIn: number) => {
  if (refreshTokenTimeout) {
    clearTimeout(refreshTokenTimeout);
  }

  // Schedule refresh 1 minute before expiration
  const refreshTime = expiresIn * 1000 - 60 * 1000;
  refreshTokenTimeout = setTimeout(refreshAccessToken, refreshTime);
};

// Refresh the access token
export const refreshAccessToken = async () => {
  try {
    const response = await apiClient.post("/auth/refresh-token");
    const { accessToken: newAccessToken } = response.data.data;

    // Update the access token
    setAccessToken(newAccessToken);

    // Setup the next refresh
    setupRefreshToken(15 * 60); // 15 minutes

    return true;
  } catch (error) {
    clearTokens();
    return false;
  }
};

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await apiClient.post("/auth/register", data);

  // Set the access token if available
  if (response.data.data.accessToken) {
    setAccessToken(response.data.data.accessToken);
    setupRefreshToken(15 * 60); // 15 minutes
  }

  return response.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await apiClient.post("/auth/login", data);

  // If two-factor auth is required, don't set the token
  if (
    response.data.data.user?.isTwoFactorEnabled &&
    !response.data.data.accessToken
  ) {
    return response.data;
  }

  // Set the access token if available
  if (response.data.data.accessToken) {
    setAccessToken(response.data.data.accessToken);
    setAuthTokens(
      response.data.data.accessToken,
      response.data.data.refreshToken
    );
    setupRefreshToken(15 * 60); // 15 minutes
  }

  return response.data;
};

export const logoutUser = async () => {
  try {
    const response = await apiClient.post("/auth/logout");
    clearTokens();
    return response.data;
  } catch (error) {
    clearTokens();
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get("/auth/me");
    return response.data;
  } catch (error) {
    // If unauthorized, try to refresh the token
    if (error instanceof AxiosError && error.response?.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the request with the new token
        const response = await apiClient.get("/auth/me");
        return response.data;
      }
    }
    throw error;
  }
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

  // Set the access token if available
  if (response.data.data?.accessToken) {
    setAccessToken(response.data.data.accessToken);
    setAuthTokens(
      response.data.data.accessToken,
      response.data.data.refreshToken
    );
    setupRefreshToken(15 * 60); // 15 minutes
  }

  return response.data;
};

export const resendVerificationEmail = async (email: string) => {
  const response = await apiClient.post("/auth/resend-verification", { email });
  return response.data;
};
