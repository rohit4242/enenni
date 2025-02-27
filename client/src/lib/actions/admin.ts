"use server";

import { currentRole } from "../auth";

export const admin = async () => {
  const role = await currentRole();

  if (role === "Admin") {
    return { success: "Allowed Server Action!" };
  }

  return { error: "Forbidden Server Action!" };
};
