import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import prisma from "../lib/prisma";
import { TransactionStatus } from "@prisma/client";

// Get all crypto wallets for the authenticated user
export const getUserCryptoWallets = async (c: Context) => {
  const user = c.get("user");

  const wallets = await prisma.userCryptoWallet.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ wallets });
};

// Get a specific crypto wallet by ID
export const getCryptoWalletById = async (c: Context) => {
  const user = c.get("user");
  const walletId = c.req.param("id");

  const wallet = await prisma.userCryptoWallet.findUnique({
    where: { id: walletId },
  });

  if (!wallet) {
    throw new HTTPException(404, { message: "Crypto wallet not found" });
  }

  // Ensure the wallet belongs to the authenticated user unless they're an admin
  const isAdmin = c.get("isAdmin") === true;
  if (wallet.userId !== user.id && !isAdmin) {
    throw new HTTPException(403, {
      message: "You do not have permission to access this crypto wallet",
    });
  }

  return c.json({ wallet });
};

// Create a new crypto wallet
export const createCryptoWallet = async (c: Context) => {
  const user = c.get("user");
  const data = await c.req.json();
  // Data is already validated by zValidator middleware

  // Check if there are too many wallets already (optional limit)
  const walletCount = await prisma.userCryptoWallet.count({
    where: { userId: user.id },
  });
  if (walletCount >= 5) {
    throw new HTTPException(400, {
      message: "Maximum number of crypto wallets reached (5)",
    });
  }

  // Check if the wallet address already exists for this user and crypto type
  const existingWallet = await prisma.userCryptoWallet.findFirst({
    where: {
      userId: user.id,
      cryptoType: data.cryptoType,
      walletAddress: data.walletAddress,
    },
  });

  if (existingWallet) {
    throw new HTTPException(400, {
      message:
        "You already have a wallet with this address for this crypto type",
    });
  }

  try {
    // Create the crypto wallet
    const newWallet = await prisma.userCryptoWallet.create({
      data: {
        userId: user.id,
        walletAddress: data.walletAddress,
        cryptoType: data.cryptoCurrency,
        nickname: data.nickname,
        walletType: data.walletType,
        chain: data.chain,
        status: TransactionStatus.PENDING,
      },
    });

    return c.json({ wallet: newWallet }, 201);
  } catch (error) {
    console.error("Error creating crypto wallet:", error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, {
      message: "Failed to create crypto wallet",
    });
  }
};

// Update an existing crypto wallet
export const updateCryptoWallet = async (c: Context) => {
  const user = c.get("user");
  const walletId = c.req.param("id");
  const data = await c.req.json();
  // Data is already validated by zValidator middleware

  // Check if the wallet exists
  const wallet = await prisma.userCryptoWallet.findUnique({
    where: { id: walletId },
  });

  if (!wallet) {
    throw new HTTPException(404, { message: "Crypto wallet not found" });
  }

  // Ensure the wallet belongs to the authenticated user
  if (wallet.userId !== user.id) {
    throw new HTTPException(403, {
      message: "You do not have permission to update this crypto wallet",
    });
  }

  // Prevent updating wallets that are already approved
  if (wallet.status === TransactionStatus.APPROVED) {
    throw new HTTPException(400, {
      message: "Cannot update an approved crypto wallet",
    });
  }

  try {
    // Update the crypto wallet
    const updatedWallet = await prisma.userCryptoWallet.update({
      where: { id: walletId },
      data,
    });

    return c.json({ wallet: updatedWallet });
  } catch (error) {
    console.error("Error updating crypto wallet:", error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, {
      message: "Failed to update crypto wallet",
    });
  }
};

// Delete a crypto wallet
export const deleteCryptoWallet = async (c: Context) => {
  const user = c.get("user");
  const walletId = c.req.param("id");

  // Check if the wallet exists
  const wallet = await prisma.userCryptoWallet.findUnique({
    where: { id: walletId },
  });

  if (!wallet) {
    throw new HTTPException(404, { message: "Crypto wallet not found" });
  }

  // Ensure the wallet belongs to the authenticated user
  if (wallet.userId !== user.id) {
    throw new HTTPException(403, {
      message: "You do not have permission to delete this crypto wallet",
    });
  }

  // Prevent deleting wallets that are already approved
  if (wallet.status === TransactionStatus.APPROVED) {
    throw new HTTPException(400, {
      message: "Cannot delete an approved crypto wallet",
    });
  }

  try {
    // Delete the crypto wallet
    await prisma.userCryptoWallet.delete({
      where: { id: walletId },
    });

    return c.json({
      success: true,
      message: "Crypto wallet deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting crypto wallet:", error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, {
      message: "Failed to delete crypto wallet",
    });
  }
};

// Admin function to verify a crypto wallet
export const verifyCryptoWallet = async (c: Context) => {
  const walletId = c.req.param("id");
  const data = await c.req.json();
  // Data is already validated by zValidator middleware

  // Check if the wallet exists
  const wallet = await prisma.userCryptoWallet.findUnique({
    where: { id: walletId },
  });

  if (!wallet) {
    throw new HTTPException(404, { message: "Crypto wallet not found" });
  }

  try {
    // Update the wallet status
    const updatedWallet = await prisma.userCryptoWallet.update({
      where: { id: walletId },
      data: {
        status: data.status,
      },
    });

    return c.json({ wallet: updatedWallet });
  } catch (error) {
    console.error("Error verifying crypto wallet:", error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, {
      message: "Failed to verify crypto wallet",
    });
  }
};

// Admin function to get all crypto wallets
export const getAllCryptoWallets = async (c: Context) => {
  const query = c.req.query();
  const status = query.status as TransactionStatus | undefined;
  const cryptoType = query.cryptoType as string | undefined;

  // Build filter conditions
  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (cryptoType) {
    where.cryptoType = cryptoType;
  }

  const wallets = await prisma.userCryptoWallet.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return c.json({ wallets });
};
