"use server";

import * as z from "zod";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

import { signIn } from "../../auth";
import { LoginSchema } from "../schemas";
import { getUserByEmail } from "../../data/user";
import { DEFAULT_LOGIN_REDIRECT } from "../../routes";
import { verifyMFA } from "./mfa";

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null
) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;

  const user = await getUserByEmail(email);

  if (!user || !user.email || !user.password) {
    return { error: "Email does not exist!" };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return { error: "Invalid Credentials!" };
  }
  

  if (user.mfaEnabled && user.mfaSecret) {
    if (code) {
      const verified = await verifyMFA(user.id, code, user.mfaSecret);
      if (!verified) {
        return { error: "Invalid MFA code" };
      }
    } else {
      return { mfaRequired: true };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" + error };
      }
    }

    throw error;
  }
};
