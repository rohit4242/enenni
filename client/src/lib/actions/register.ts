"use server";

import * as z from "zod";
import bcrypt from "bcrypt";

import { RegisterSchema } from "@/lib/schemas";
import db from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { initializeUserBalances } from "@/lib/user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, name, password, loginType } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const user = await getUserByEmail(email);

  if (!user) {
    return { error: "User not found!" };
  }

  await initializeUserBalances(user.id);

  return { success: "User created successfully!" };
};
