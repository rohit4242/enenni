import apiClient from "./client";

export const getProfile = async () => {
    const response = await apiClient.get("/users/profile");
    return response.data;
};

export const updateProfile = async (data: { name?: string; [key: string]: any }) => {
    const response = await apiClient.patch("/users/profile", data);
    return response.data;
};

export const enableTwoFactor = async () => {
    const response = await apiClient.post("/users/two-factor/enable");
    return response.data;
};

export const verifyTwoFactorSetup = async (code: string) => {
    const response = await apiClient.post("/users/two-factor/verify", { code });
    return response.data;
};

export const disableTwoFactor = async () => {
    const response = await apiClient.post("/users/two-factor/disable");
    return response.data;
};

export const changePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const response = await apiClient.post("/users/password", data);
    return response.data;
};


















