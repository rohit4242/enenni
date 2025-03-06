import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import prisma from "../lib/prisma";
import { CurrencyType } from "@prisma/client";
// Dummy data for enenni bank accounts
const dummyAccounts = [
  {
    accountName: "AED Account 1",
    accountNumber: "AE12345678901234567890",
    iban: "AE12345678901234567890",
    bankName: "Bank of Dubai",
    currency: "AED",
    swiftCode: "BODUAEAD",
    description: "First AED account",
    isActive: true,
  },
  {
    accountName: "AED Account 2",
    accountNumber: "AE09876543210987654321",
    iban: "AE09876543210987654321",
    bankName: "Emirates NBD",
    currency: "AED",
    swiftCode: "EBILAEAD",
    description: "Second AED account",
    isActive: true,
  },
  {
    accountName: "USD Account 1",
    accountNumber: "US12345678901234567890",
    iban: "US12345678901234567890",
    bankName: "Bank of America",
    currency: "USD",
    swiftCode: "BOFAUS3N",
    description: "USD account",
    isActive: true,
  },
];

// Get all enenni bank accounts (admin)
export const getAllEnenniBankAccounts = async (c: Context) => {
  const { currency, isActive } = c.req.query();

  const filter: any = {};

  if (currency) {
    filter.currency = currency;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const accounts = await prisma.enenniBankAccount.findMany({
    where: filter,
    orderBy: { createdAt: "desc" },
  });

  // If no accounts found, return dummy accounts
  if (accounts.length === 0) {
    return c.json({ accounts: dummyAccounts });
  }

  return c.json({ accounts });
};

// Get a specific enenni bank account by ID
export const getEnenniBankAccountById = async (c: Context) => {
  const accountId = c.req.param("id");

  const account = await prisma.enenniBankAccount.findUnique({
    where: {
      id: accountId,
    },
  });

  if (!account) {
    throw new HTTPException(404, { message: "Enenni bank account not found" });
  }

  return c.json({ account });
};

// Create a new enenni bank account (admin only)
export const createEnenniBankAccount = async (c: Context) => {
  const data = await c.req.json();
  // Data is already validated by zValidator middleware

  try {
    const newAccount = await prisma.enenniBankAccount.create({
      data: {
        ...data,
        isActive: true,
      },
    });

    return c.json({ account: newAccount }, 201);
  } catch (error) {
    console.error("Error creating enenni bank account:", error);
    throw new HTTPException(500, { message: "Failed to create bank account" });
  }
};

// Update an existing enenni bank account (admin only)
export const updateEnenniBankAccount = async (c: Context) => {
  const accountId = c.req.param("id");
  const data = await c.req.json();

  try {
    // Check if the account exists
    const account = await prisma.enenniBankAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new HTTPException(404, {
        message: "Enenni bank account not found",
      });
    }

    // Update the account
    const updatedAccount = await prisma.enenniBankAccount.update({
      where: { id: accountId },
      data,
    });

    return c.json({ account: updatedAccount });
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    console.error("Error updating enenni bank account:", error);
    throw new HTTPException(500, { message: "Failed to update bank account" });
  }
};

// Delete an enenni bank account (admin only)
export const deleteEnenniBankAccount = async (c: Context) => {
  const accountId = c.req.param("id");

  try {
    // Check if the account exists
    const account = await prisma.enenniBankAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new HTTPException(404, {
        message: "Enenni bank account not found",
      });
    }

    // We might need to check for associated transactions, but there seems to be no direct relation
    // in the schema between Transaction and EnenniBankAccount

    // Delete the account
    await prisma.enenniBankAccount.delete({
      where: { id: accountId },
    });

    return c.json({ message: "Bank account deleted successfully" }, 200);
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    console.error("Error deleting enenni bank account:", error);
    throw new HTTPException(500, { message: "Failed to delete bank account" });
  }
};

// Verify an enenni bank account (admin only)
export const verifyEnenniBankAccount = async (c: Context) => {
  const accountId = c.req.param("id");
  const { status, remarks } = await c.req.json();

  try {
    // Check if the account exists
    const account = await prisma.enenniBankAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new HTTPException(404, {
        message: "Enenni bank account not found",
      });
    }

    // Update the verification status
    const updatedAccount = await prisma.enenniBankAccount.update({
      where: { id: accountId },
      data: {
        isActive: true,
      },
    });

    return c.json({ account: updatedAccount });
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    console.error("Error verifying enenni bank account:", error);
    throw new HTTPException(500, { message: "Failed to verify bank account" });
  }
};

// Toggle active status of an enenni bank account (admin only)
export const toggleEnenniBankAccountStatus = async (c: Context) => {
  const accountId = c.req.param("id");

  try {
    // Check if the account exists
    const account = await prisma.enenniBankAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new HTTPException(404, {
        message: "Enenni bank account not found",
      });
    }

    // Toggle the active status
    const updatedAccount = await prisma.enenniBankAccount.update({
      where: { id: accountId },
      data: {
        isActive: !account.isActive,
      },
    });

    return c.json({ account: updatedAccount });
  } catch (error) {
    if (error instanceof HTTPException) throw error;

    console.error("Error toggling enenni bank account status:", error);
    throw new HTTPException(500, {
      message: "Failed to update bank account status",
    });
  }
};
