"use server";

import prisma from "@/lib/db";


export const getWallets = async (userId: string) => {
  try {
    const wallets = await prisma.wallet.findMany({
      where: {
        userId: userId
      }

    });

    return wallets;
  } catch (error) {
    console.error("Failed to fetch wallets:", error);
    return [];
  }
};
