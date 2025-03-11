import axios from "axios";
import Cookies from "js-cookie";

// Use environment variables for API URL with fallback
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Cookie names for tokens
const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

// Create axios instance with environment-aware configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // In development, we disable withCredentials to avoid CORS issues
  // In production, we enable it for proper cookie handling
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  },
});

// Function to refresh the access token
const refreshAccessToken = async () => {
  try {
    const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);
    
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh-token`,
      { refreshToken },
      { withCredentials: process.env.NODE_ENV === "production" }
    );
    
    const { accessToken } = response.data.data;
    
    // Update the cookie with the new access token
    if (accessToken) {
      Cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: 1/96, // 15 minutes in days
      });
      
      return accessToken;
    }
    
    return null;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    
    // Clear tokens on refresh failure
    Cookies.remove(ACCESS_TOKEN_COOKIE);
    Cookies.remove(REFRESH_TOKEN_COOKIE);
    
    // Notify the UI about session expiration
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:sessionExpired"));
    }
    
    return null;
  }
};

// Add request interceptor to dynamically set the Authorization header
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get(ACCESS_TOKEN_COOKIE);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for handling common error scenarios
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Skip error logging for auth/me endpoint when not logged in
    const isAuthMeEndpoint = originalRequest?.url?.includes('/auth/me');
    const isLoginPage = typeof window !== 'undefined' && 
      (window.location.pathname.includes('/login') || 
       window.location.pathname.includes('/auth/login'));
    
    // Don't show errors for expected auth check failures on login page
    if (isAuthMeEndpoint && isLoginPage && error.response?.status === 500) {
      // Silently fail without showing error in console
      return Promise.reject(error);
    }

    // Handle unauthorized errors (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip token refresh for /auth/me endpoint when user is not logged in yet
      if (isAuthMeEndpoint && !getAccessToken()) {
        return Promise.reject(error);
      }

      // Set a flag to prevent infinite retry loops
      originalRequest._retry = true;

      // Try to refresh the access token
      try {
        const newAccessToken = await refreshAccessToken();
        
        if (newAccessToken) {
          // Update the Authorization header with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Retry the original request with the new token
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, silently handle it
        if (isLoginPage) {
          return Promise.reject(error);
        }
        
        // Clear tokens and redirect to login for non-login pages
        clearAuthTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    // Handle forbidden errors (403)
    if (error.response?.status === 403) {
      console.error(
        "Permission denied. User doesn't have access to this resource."
      );
    }

    // Only log errors in development and non-login pages
    if (process.env.NODE_ENV !== 'production' && !isLoginPage) {
      console.error(
        `API Error: ${error.response?.status} - ${error.response?.statusText}`,
        error.response?.data || error.message
      );
    }

    return Promise.reject(error);
  }
);

// Helper functions for token management
export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  if (accessToken) {
    // Use more permissive cookie settings in development
    const isProduction = process.env.NODE_ENV === "production";
    
    Cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
      secure: isProduction,
      sameSite: isProduction ? "lax" : "strict",
      path: "/",
      expires: 1/96, // 15 minutes in days
    });
    
    // For debugging in development
    if (!isProduction) {
      console.log(`Access token cookie set: ${!!Cookies.get(ACCESS_TOKEN_COOKIE)}`);
    }
  }
  
  if (refreshToken) {
    const isProduction = process.env.NODE_ENV === "production";
    
    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      secure: isProduction,
      sameSite: isProduction ? "lax" : "strict",
      path: "/",
      expires: 7, // 7 days
    });
    
    // For debugging in development
    if (!isProduction) {
      console.log(`Refresh token cookie set: ${!!Cookies.get(REFRESH_TOKEN_COOKIE)}`);
    }
  }
};

export const clearAuthTokens = () => {
  Cookies.remove(ACCESS_TOKEN_COOKIE);
  Cookies.remove(REFRESH_TOKEN_COOKIE);
};

export const getAccessToken = () => {
  return Cookies.get(ACCESS_TOKEN_COOKIE);
};

export const getRefreshToken = () => {
  return Cookies.get(REFRESH_TOKEN_COOKIE);
};

export default apiClient;