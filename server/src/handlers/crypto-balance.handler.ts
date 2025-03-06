import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import * as cryptoBalanceService from "../services/crypto-balance.service";
import { CryptoType } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../errors/AppError";

// Get all crypto balances (admin)
export const getAllCryptoBalances = async (c: Context) => {
  try {
    const { cryptoType, minBalance, maxBalance, hasWalletAddress } =
      c.req.query();

    const filters: any = {};

    if (cryptoType) {
      filters.cryptoType = cryptoType as CryptoType;
    }

    if (minBalance !== undefined) {
      filters.minBalance = parseFloat(minBalance);
    }

    if (maxBalance !== undefined) {
      filters.maxBalance = parseFloat(maxBalance);
    }

    if (hasWalletAddress !== undefined) {
      filters.hasWalletAddress = hasWalletAddress === "true";
    }

    const balances = await cryptoBalanceService.getAllCryptoBalances(filters);

    return c.json({
      success: true,
      data: balances,
    });
  } catch (error) {
    console.error("Error getting all crypto balances:", error);

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, { message: "Failed to get crypto balances" });
  }
};

// Get a crypto balance by ID (admin)
export const getCryptoBalanceById = async (c: Context) => {
  try {
    const id = c.req.param("id");

    const balance = await cryptoBalanceService.getCryptoBalanceById(id);

    return c.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error getting crypto balance by ID:", error);

    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, { message: "Failed to get crypto balance" });
  }
};

// Get all crypto balances for the authenticated user
export const getUserCryptoBalances = async (c: Context) => {
  try {
    const userId = c.get("user")?.id;

    const balances = await cryptoBalanceService.getUserCryptoBalances(userId);

    return c.json({
      success: true,
      data: balances,
    });
  } catch (error) {
    console.error("Error getting user crypto balances:", error);

    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Failed to get user crypto balances",
    });
  }
};

// Get a user's crypto balance by crypto type
export const getUserCryptoBalanceByCryptoType = async (c: Context) => {
  try {
    const userId = c.get("user")?.id;
    const cryptoType = c.req.param("cryptoType") as CryptoType;

    const balance = await cryptoBalanceService.getUserCryptoBalanceByCryptoType(
      userId,
      cryptoType
    );

    return c.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error getting user crypto balance by crypto type:", error);

    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Failed to get user crypto balance",
    });
  }
};

// Create a new crypto balance (admin)
export const createCryptoBalance = async (c: Context) => {
  try {
    const data = await c.req.json();

    const balance = await cryptoBalanceService.createCryptoBalance(data);

    return c.json(
      {
        success: true,
        data: balance,
      },
      201
    );
  } catch (error) {
    console.error("Error creating crypto balance:", error);

    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }

    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Failed to create crypto balance",
    });
  }
};

// Update a crypto balance (admin)
export const updateCryptoBalance = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();

    const balance = await cryptoBalanceService.updateCryptoBalance(id, data);

    return c.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error updating crypto balance:", error);

    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }

    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Failed to update crypto balance",
    });
  }
};

// Add to a user's crypto balance (admin)
export const addToCryptoBalance = async (c: Context) => {
  try {
    const userId = c.req.param("userId");
    const cryptoType = c.req.param("cryptoType") as CryptoType;
    const { amount, description } = await c.req.json();

    const balance = await cryptoBalanceService.addToCryptoBalance(
      userId,
      cryptoType,
      amount,
      description
    );

    return c.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error adding to crypto balance:", error);

    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }

    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Failed to add to crypto balance",
    });
  }
};

// Subtract from a user's crypto balance (admin)
export const subtractFromCryptoBalance = async (c: Context) => {
  try {
    const userId = c.req.param("userId");
    const cryptoType = c.req.param("cryptoType") as CryptoType;
    const { amount, description } = await c.req.json();

    const balance = await cryptoBalanceService.subtractFromCryptoBalance(
      userId,
      cryptoType,
      amount,
      description
    );

    return c.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error subtracting from crypto balance:", error);

    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }

    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Failed to subtract from crypto balance",
    });
  }
};

// Add to the authenticated user's crypto balance
export const addToMyCryptoBalance = async (c: Context) => {
  try {
    const userId = c.get("userId");
    const cryptoType = c.req.param("cryptoType") as CryptoType;
    const { amount, description } = await c.req.json();

    const balance = await cryptoBalanceService.addToCryptoBalance(
      userId,
      cryptoType,
      amount,
      description
    );

    return c.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error adding to user's crypto balance:", error);

    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }

    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Failed to add to crypto balance",
    });
  }
};

// Subtract from the authenticated user's crypto balance
export const subtractFromMyCryptoBalance = async (c: Context) => {
  try {
    const userId = c.get("userId");
    const cryptoType = c.req.param("cryptoType") as CryptoType;
    const { amount, description } = await c.req.json();

    const balance = await cryptoBalanceService.subtractFromCryptoBalance(
      userId,
      cryptoType,
      amount,
      description
    );

    return c.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error subtracting from user's crypto balance:", error);

    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }

    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Failed to subtract from crypto balance",
    });
  }
};

// Create a crypto balance transaction
export const createCryptoBalanceTransaction = async (c: Context) => {
  try {
    const {
      userId,
      cryptoType,
      amount,
      transactionType,
      walletAddress,
      description,
      network,


    } = await c.req.json();

    const result = await cryptoBalanceService.createCryptoBalanceTransaction(
      userId,
      cryptoType,
      amount,
      transactionType,
      walletAddress,
      description,
      network,
    );

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error creating crypto balance transaction:", error);

    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }

    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Failed to create crypto balance transaction",
    });
  }
};

// Transfer between the authenticated user's crypto balances
export const transferBetweenMyCryptoBalances = async (c: Context) => {
  try {
    const userId = c.get("userId");
    const { fromCryptoType, toCryptoType, amount, description } =
      await c.req.json();

    const result = await cryptoBalanceService.transferBetweenCryptoBalances(
      userId,
      fromCryptoType,
      toCryptoType,
      amount,
      description
    );

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error transferring between crypto balances:", error);

    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }

    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Failed to transfer between crypto balances",
    });
  }
};

// Update wallet address for the authenticated user's crypto balance
export const updateMyWalletAddress = async (c: Context) => {
  try {
    const userId = c.get("userId");
    const cryptoType = c.req.param("cryptoType") as CryptoType;
    const { walletAddress } = await c.req.json();

    // Get the balance
    const balance = await cryptoBalanceService.getUserCryptoBalanceByCryptoType(
      userId,
      cryptoType
    );

    // Update the wallet address
    const updatedBalance = await cryptoBalanceService.updateWalletAddress(
      balance.id,
      walletAddress
    );

    return c.json({
      success: true,
      data: updatedBalance,
    });
  } catch (error) {
    console.error("Error updating wallet address:", error);

    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Failed to update wallet address",
    });
  }
};

// Delete a crypto balance (admin)
export const deleteCryptoBalance = async (c: Context) => {
  try {
    const id = c.req.param("id");

    await cryptoBalanceService.deleteCryptoBalance(id);

    return c.json({
      success: true,
      message: "Crypto balance deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting crypto balance:", error);

    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }

    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: "Failed to delete crypto balance",
    });
  }
};
