import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { TransactionStatus } from "@prisma/client";
import prisma from "../lib/prisma";
// Get all bank accounts for the authenticated user
export const getUserBankAccounts = async (c: Context) => {
  const userId = c.get("userId");

  const accounts = await prisma.userBankAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ accounts });
};

// Get a specific bank account by ID
export const getBankAccountById = async (c: Context) => {
  const userId = c.get("userId");
  const accountId = c.req.param("id");

  const account = await prisma.userBankAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new HTTPException(404, { message: "Bank account not found" });
  }

  // Ensure the account belongs to the authenticated user unless they're an admin
  const isAdmin = c.get("isAdmin") === true;
  if (account.userId !== userId && !isAdmin) {
    throw new HTTPException(403, {
      message: "You do not have permission to access this bank account",
    });
  }

  return c.json({ account });
};

// Create a new bank account
export const createBankAccount = async (c: Context) => {
  const user = c.get("user");
  const data = await c.req.json();
  // Data is already validated by zValidator middleware

  // Check if there are too many accounts already (optional limit)
  const accountCount = await prisma.userBankAccount.count({
    where: { userId: user.id },
  });
  if (accountCount >= 5) {
    throw new HTTPException(400, {
      message: "Maximum number of bank accounts reached (5)",
    });
  }

  try {
    // Create the bank account with properly mapped field names
    const newAccount = await prisma.userBankAccount.create({
      data: {
        userId: user.id,
        accountHolderName: data.accountHolderName, // Map from schema to Prisma model
        bankName: data.bankName,
        bankAddress: data.bankAddress,
        bankCountry: data.bankCountry,
        accountCurrency: data.accountCurrency, // Map from schema to Prisma model
        iban: data.iban,
        accountNumber: data.accountNumber,
        proofDocumentUrl: data.proofDocumentUrl,
        status: TransactionStatus.PENDING,
      },
    });

    return c.json({ account: newAccount }, 201);
  } catch (error) {
    console.error("Error creating bank account:", error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, {
      message: "Failed to create bank account",
    });
  }
};

// Update an existing bank account
export const updateBankAccount = async (c: Context) => {
  const userId = c.get("userId");
  const accountId = c.req.param("id");
  const data = await c.req.json();

  // Find the account first
  const account = await prisma.userBankAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new HTTPException(404, { message: "Bank account not found" });
  }

  // Ensure the account belongs to the authenticated user
  if (account.userId !== userId) {
    throw new HTTPException(403, {
      message: "You do not have permission to update this bank account",
    });
  }

  // Don't allow updates if the account is already verified
  if (account.status === TransactionStatus.APPROVED) {
    throw new HTTPException(400, {
      message: "Verified bank accounts cannot be modified",
    });
  }

  const updatedAccount = await prisma.userBankAccount.update({
    where: { id: accountId },
    data: {
      ...data,
      status: TransactionStatus.PENDING, // Reset to pending on update
    },
  });

  return c.json({ account: updatedAccount });
};

// Delete a bank account
export const deleteBankAccount = async (c: Context) => {
  const userId = c.get("userId");
  const accountId = c.req.param("id");

  // Find the account first
  const account = await prisma.userBankAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new HTTPException(404, { message: "Bank account not found" });
  }

  // Ensure the account belongs to the authenticated user
  if (account.userId !== userId) {
    throw new HTTPException(403, {
      message: "You do not have permission to delete this bank account",
    });
  }

  // Don't allow deletion if the account is being used in transactions
  // This would require additional checks if you have transactions linked to accounts

  await prisma.userBankAccount.delete({
    where: { id: accountId },
  });

  return c.json({
    success: true,
    message: "Bank account deleted successfully",
  });
};

// Admin Only: Verify a bank account
export const verifyBankAccount = async (c: Context) => {
  const accountId = c.req.param("id");
  const { status, verifyIban, verifyAccountNumber } = await c.req.json();

  const account = await prisma.userBankAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new HTTPException(404, { message: "Bank account not found" });
  }

  const updatedAccount = await prisma.userBankAccount.update({
    where: { id: accountId },
    data: {
      status,
    },
  });

  return c.json({ account: updatedAccount });
};

// Admin Only: Get all bank accounts across users
export const getAllBankAccounts = async (c: Context) => {
  const { status } = await c.req.query();

  const where = status ? { status: status as TransactionStatus } : {};

  const accounts = await prisma.userBankAccount.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ accounts });
};

// Update proof document URL
export const updateProofDocument = async (c: Context) => {
  const userId = c.get("userId");
  const accountId = c.req.param("id");
  const { proofDocumentUrl } = await c.req.json();

  try {
    // First, check if the account exists and belongs to the user
    const existingAccount = await prisma.userBankAccount.findUnique({
      where: { id: accountId },
    });

    if (!existingAccount) {
      throw new HTTPException(404, { message: "Bank account not found" });
    }

    // Verify ownership
    if (existingAccount.userId !== userId) {
      throw new HTTPException(403, { message: "You don't have permission to update this bank account" });
    }

    // Update the proof document URL
    const updatedAccount = await prisma.userBankAccount.update({
      where: { id: accountId },
      data: {
        proofDocumentUrl,
      },
    });

    return c.json({
      success: true,
      message: "Proof document updated successfully",
      account: updatedAccount,
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error("Error updating proof document:", error);
    throw new HTTPException(500, { message: "Failed to update proof document" });
  }
};
