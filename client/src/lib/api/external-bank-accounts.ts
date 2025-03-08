import apiClient from "./client";
import { NewBankAccountFormValues } from "../schemas/bank-account";
import { BankAccount } from "../types/bank-account";
import axios from "axios";

export const getBankAccounts = async () => {
  const response = await apiClient.get("/external-bank-accounts");
  return response.data;
};

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

/**
 * Uploads an image file for a bank account
 * @param file - The image file to upload
 * @param bankAccountId - The ID of the bank account to associate with the image
 * @returns An object containing the upload result data, status, and any errors
 */
export const uploadImage = async (file: File, bankAccountId: string) => {
  try {
    // Validate inputs
    if (!file) {
      throw new Error("No file provided");
    }
    
    if (!bankAccountId) {
      throw new Error("Bank account ID is required");
    }
    
    // Validate file type
    const validImageTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validImageTypes.includes(file.type)) {
      throw new Error("Invalid file type. Please upload a JPEG, PNG, WebP image, or PDF document");
    }
    
    // Validate file size (max 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      throw new Error("File size exceeds 5MB limit");
    }
    
    // Create form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "bank_proofs");
    formData.append("referenceType", "BANK_PROOF");
    formData.append("referenceId", bankAccountId);
    
    // Set up request with proper headers for file upload
    const response = await apiClient.post("/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        // You can expose this progress data if needed for UI progress indicators
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.debug(`Upload progress: ${percentCompleted}%`);
      },
    });
    
    // Ensure the response data has a url property for compatibility with the UI components
    const responseData = response.data;
    console.log("responseData: ", responseData);
    
    // Extract the URL from the nested structure
    // The actual response structure is: { success: true, data: { url: "..." } }
    let url = "";
    
    // Check if the response has the expected structure
    if (responseData.success && responseData.data && responseData.data.url) {
      url = responseData.data.url;
    } else if (responseData.url) {
      url = responseData.url;
    } else if (responseData.fileUrl) {
      url = responseData.fileUrl;
    } else if (responseData.imageUrl) {
      url = responseData.imageUrl;
    } else if (responseData.path) {
      url = responseData.path;
    }
    
    // If we still don't have a URL, throw an error
    if (!url) {
      console.error("No URL found in response data:", responseData);
      throw new Error("No URL returned from upload");
    }
    
    const data = {
      ...responseData,
      url: url,
    };
    
    return {
      data,
      status: response.status,
      error: null,
    };
  } catch (error) {
    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      // Handle network or API errors
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message;
      
      console.error(`Image upload failed: ${statusCode} - ${errorMessage}`);
      
      return {
        data: null,
        status: statusCode || 500,
        error: {
          message: errorMessage || "Failed to upload image",
          details: error.response?.data || null,
        },
      };
    } else {
      // Handle validation or other errors
      const err = error as Error;
      console.error(`Image upload error: ${err.message}`);
      
      return {
        data: null,
        status: 400,
        error: {
          message: err.message || "Failed to upload image",
          details: null,
        },
      };
    }
  }
};
