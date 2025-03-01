"use server";

import { signOut } from "@/auth";

export const logout = async () => {
  // some server stuff
  try {
    await signOut();
  } catch (error) {
    console.error("Logout error:", error);
    return { error: "Logout failed" };
  }
};
