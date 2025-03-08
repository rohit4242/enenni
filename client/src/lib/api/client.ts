import axios from "axios";
import Cookies from "js-cookie";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://mkxkyrbvfc.execute-api.us-east-1.amazonaws.com/prod/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${Cookies.get("token")}`,
  },
});

// Add response interceptor for handling common error scenarios
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized errors (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn(
        "Authentication error detected. Token may be invalid or expired."
      );

      // Set a flag to prevent infinite retry loops
      originalRequest._retry = true;

      // You can implement token refresh logic here if needed
      // For now, just log the error and reject the promise
      console.error("Authentication failed. User needs to log in again.");

      // If we're on the client side, we could dispatch an event to notify the UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:sessionExpired"));
      }
    }

    // Handle forbidden errors (403)
    if (error.response?.status === 403) {
      console.error(
        "Permission denied. User doesn't have access to this resource."
      );
    }

    // Log all API errors for debugging
    console.error(
      `API Error: ${error.response?.status} - ${error.response?.statusText}`,
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);
export default apiClient;
