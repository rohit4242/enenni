import { AxiosError } from "axios";
import apiClient, { clearAuthTokens, setAuthTokens } from "./client";

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
    
    // Handle API errors and extract the error message from the server response
    if (error instanceof AxiosError && error.response?.data) {
      // Format from server: { success: false, error: { code: 'XXX', message: 'XXX' } }
      if (error.response.data.error && error.response.data.error.message) {
        console.error("Token refresh error:", error.response.data.error.message);
      } else if (error.response.data.message) {
        console.error("Token refresh error:", error.response.data.message);
      }
    }
    
    return false;
  }
};

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  isEntity: boolean;
}) => {
  try {
    const response = await apiClient.post("/auth/register", data);

    // Set the access token if available
    if (response.data.data.accessToken) {
      setAccessToken(response.data.data.accessToken);
      setupRefreshToken(15 * 60); // 15 minutes
    }

    return response.data;
  } catch (error) {
    console.log("Registration error:", error);
    // Handle API errors and extract the error message from the server response
    if (error instanceof AxiosError && error.response?.data) {
      // Format from server: { success: false, error: { code: 'XXX', message: 'XXX' } }
      if (error.response.data.error && error.response.data.error.message) {
        // Check for specific conflict error (email already exists)
        if (error.response.data.error.code === 'CONFLICT_ERROR') {
          console.log('Email conflict detected:', error.response.data.error.message);
        }
        
        return {
          status: 'error',
          error: error.response.data.error.message,
          code: error.response.data.error.code
        };
      }
      
      // Handle other response formats
      return {
        status: 'error',
        error: error.response.data.message || error.response.data.error || "Registration failed"
      };
    }
    
    // If no specific error message, provide a generic one
    return {
      status: 'error',
      error: "Registration failed. Please try again later."
    };
  }
};

export const loginUser = async (data: { email: string; password: string }) => {
  try {
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
  } catch (error) {
    // Handle API errors and extract the error message from the server response
    if (error instanceof AxiosError && error.response?.data) {
      // Format from server: { success: false, error: { code: 'XXX', message: 'XXX' } }
      if (error.response.data.error && error.response.data.error.message) {
        return {
          status: 'error',
          error: error.response.data.error.message
        };
      }
      
      // Handle other response formats
      return {
        status: 'error',
        error: error.response.data.message || error.response.data.error || "Invalid credentials"
      };
    }
    
    // If no specific error message, provide a generic one
    return {
      status: 'error',
      error: "Authentication failed. Please check your credentials and try again."
    };
  }
};

export const logoutUser = async () => {
  try {
    const response = await apiClient.post("/auth/logout");
    clearTokens();
    clearAuthTokens();
    return response.data;
  } catch (error) {
    clearTokens();
    // Handle API errors and extract the error message from the server response
    if (error instanceof AxiosError && error.response?.data) {
      // Format from server: { success: false, error: { code: 'XXX', message: 'XXX' } }
      if (error.response.data.error && error.response.data.error.message) {
        return {
          status: 'error',
          error: error.response.data.error.message
        };
      }
      
      // Handle other response formats
      return {
        status: 'error',
        error: error.response.data.message || error.response.data.error || "Logout failed"
      };
    }
    
    // If no specific error message, provide a generic one
    return {
      status: 'error',
      error: "Logout failed. Please try again."
    };
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
        try {
          const response = await apiClient.get("/auth/me");
          return response.data;
        } catch (retryError) {
          // Handle retry error
          if (retryError instanceof AxiosError && retryError.response?.data) {
            // Format from server: { success: false, error: { code: 'XXX', message: 'XXX' } }
            if (retryError.response.data.error && retryError.response.data.error.message) {
              return {
                status: 'error',
                error: retryError.response.data.error.message
              };
            }
            
            // Handle other response formats
            return {
              status: 'error',
              error: retryError.response.data.message || retryError.response.data.error || "Authentication failed"
            };
          }
        }
      }
    }
    
    // Handle API errors and extract the error message from the server response
    if (error instanceof AxiosError && error.response?.data) {
      // Format from server: { success: false, error: { code: 'XXX', message: 'XXX' } }
      if (error.response.data.error && error.response.data.error.message) {
        return {
          status: 'error',
          error: error.response.data.error.message
        };
      }
      
      // Handle other response formats
      return {
        status: 'error',
        error: error.response.data.message || error.response.data.error || "Failed to get user information"
      };
    }
    
    // If no specific error message, provide a generic one
    return {
      status: 'error',
      error: "Failed to get user information. Please try again."
    };
  }
};

export const verifyEmail = async (code: string, email: string) => {
  try {
    const response = await apiClient.post("/auth/verify-email", { code, email });
    return response.data;
  } catch (error) {
    // Handle API errors and extract the error message from the server response
    if (error instanceof AxiosError && error.response?.data) {
      // Format from server: { success: false, error: { code: 'XXX', message: 'XXX' } }
      if (error.response.data.error && error.response.data.error.message) {
        return {
          status: 'error',
          error: error.response.data.error.message
        };
      }
      
      // Handle other response formats
      return {
        status: 'error',
        error: error.response.data.message || error.response.data.error || "Verification failed"
      };
    }
    
    // If no specific error message, provide a generic one
    return {
      status: 'error',
      error: "Email verification failed. Please try again."
    };
  }
};

export const requestPasswordReset = async (email: string) => {
  try {
    const response = await apiClient.post("/auth/reset-password", { email });
    return response.data;
  } catch (error) {
    // Handle API errors and extract the error message from the server response
    if (error instanceof AxiosError && error.response?.data) {
      // Format from server: { success: false, error: { code: 'XXX', message: 'XXX' } }
      if (error.response.data.error && error.response.data.error.message) {
        return {
          status: 'error',
          error: error.response.data.error.message
        };
      }
      
      // Handle other response formats
      return {
        status: 'error',
        error: error.response.data.message || error.response.data.error || "Password reset failed"
      };
    }
    
    // If no specific error message, provide a generic one
    return {
      status: 'error',
      error: "Unable to reset password. Please try again later."
    };
  }
};

export const resetPassword = async (data: {
  token: string;
  password: string;
}) => {
  try {
    const response = await apiClient.post("/auth/new-password", data);
    return response.data;
  } catch (error) {
    // Handle API errors and extract the error message from the server response
    if (error instanceof AxiosError && error.response?.data) {
      // Format from server: { success: false, error: { code: 'XXX', message: 'XXX' } }
      if (error.response.data.error && error.response.data.error.message) {
        return {
          status: 'error',
          error: error.response.data.error.message
        };
      }
      
      // Handle other response formats
      return {
        status: 'error',
        error: error.response.data.message || error.response.data.error || "Password reset failed"
      };
    }
    
    // If no specific error message, provide a generic one
    return {
      status: 'error',
      error: "Unable to reset password. The link may have expired."
    };
  }
};

export const verifyTwoFactor = async (data: {
  email: string;
  code: string;
}) => {
  try {
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
  } catch (error) {
    // Handle API errors and extract the error message from the server response
    if (error instanceof AxiosError && error.response?.data) {
      // Format from server: { success: false, error: { code: 'XXX', message: 'XXX' } }
      if (error.response.data.error && error.response.data.error.message) {
        return {
          status: 'error',
          error: error.response.data.error.message
        };
      }
      
      // Handle other response formats
      return {
        status: 'error',
        error: error.response.data.message || error.response.data.error || "Invalid verification code"
      };
    }
    
    // If no specific error message, provide a generic one
    return {
      status: 'error',
      error: "Two-factor authentication failed. Please try again."
    };
  }
};

export const resendVerificationEmail = async (email: string) => {
  try {
    const response = await apiClient.post("/auth/resend-verification", { email });
    return response.data;
  } catch (error) {
    // Handle API errors and extract the error message from the server response
    if (error instanceof AxiosError && error.response?.data) {
      // Format from server: { success: false, error: { code: 'XXX', message: 'XXX' } }
      if (error.response.data.error && error.response.data.error.message) {
        return {
          status: 'error',
          error: error.response.data.error.message
        };
      }
      
      // Handle other response formats
      return {
        status: 'error',
        error: error.response.data.message || error.response.data.error || "Unable to resend verification"
      };
    }
    
    // If no specific error message, provide a generic one
    return {
      status: 'error',
      error: "Unable to resend verification email. Please try again later."
    };
  }
};

export const sendLoginVerificationCode = async (email: string) => {
  try {
    const response = await apiClient.post("/auth/send-login-verification", { email });
    return response.data;
  } catch (error) {
    // Handle API errors and extract the error message from the server response
    if (error instanceof AxiosError && error.response?.data) {
      // Format from server: { success: false, error: { code: 'XXX', message: 'XXX' } }
      if (error.response.data.error && error.response.data.error.message) {
        return {
          status: 'error',
          error: error.response.data.error.message
        };
      }
      
      // Handle other response formats
      return {
        status: 'error',
        error: error.response.data.message || error.response.data.error || "Failed to send verification code"
      };
    }
    
    // If no specific error message, provide a generic one
    return {
      status: 'error',
      error: "Failed to send verification code. Please try again."
    };
  }
};

export const verifyLoginCode = async (data: {
  email: string;
  code: string;
}) => {
  try {
    const response = await apiClient.post("/auth/verify-login-code", data);

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
  } catch (error) {
    // Handle API errors and extract the error message from the server response
    if (error instanceof AxiosError && error.response?.data) {
      // Format from server: { success: false, error: { code: 'XXX', message: 'XXX' } }
      if (error.response.data.error && error.response.data.error.message) {
        return {
          status: 'error',
          error: error.response.data.error.message
        };
      }
      
      // Handle other response formats
      return {
        status: 'error',
        error: error.response.data.message || error.response.data.error || "Invalid verification code"
      };
    }
    
    // If no specific error message, provide a generic one
    return {
      status: 'error',
      error: "Login verification failed. Please try again."
    };
  }
};
