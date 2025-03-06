import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import * as fiatBalanceService from "../services/fiat-balance.service";
import { CurrencyType } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../errors/AppError";

// Get all fiat balances (admin)
export const getAllFiatBalances = async (c: Context) => {
  try {
    const { currency, minBalance, maxBalance } = c.req.query();
    
    const filters: any = {};
    
    if (currency) {
      filters.currency = currency as CurrencyType;
    }
    
    if (minBalance !== undefined) {
      filters.minBalance = parseFloat(minBalance);
    }
    
    if (maxBalance !== undefined) {
      filters.maxBalance = parseFloat(maxBalance);
    }
    
    const balances = await fiatBalanceService.getAllFiatBalances(filters);
    
    return c.json({
      success: true,
      data: balances,
    });
  } catch (error) {
    console.error("Error getting all fiat balances:", error);
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    throw new HTTPException(500, { message: "Failed to get fiat balances" });
  }
};

// Get a fiat balance by ID (admin)
export const getFiatBalanceById = async (c: Context) => {
  try {
    const id = c.req.param("id");
    
    const balance = await fiatBalanceService.getFiatBalanceById(id);
    
    return c.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error getting fiat balance by ID:", error);
    
    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    throw new HTTPException(500, { message: "Failed to get fiat balance" });
  }
};

// Get all fiat balances for the authenticated user
export const getUserFiatBalances = async (c: Context) => {
  try {
    const userId = c.get("user").id;
    
    const balances = await fiatBalanceService.getUserFiatBalances(userId);
    
    return c.json({
      success: true,
      data: balances,
    });
  } catch (error) {
    console.error("Error getting user fiat balances:", error);
    
    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    throw new HTTPException(500, { message: "Failed to get user fiat balances" });
  }
};

// Get a user's fiat balance by currency
export const getUserFiatBalanceByCurrency = async (c: Context) => {
  try {
    const userId = c.get("user")?.id;
    const currency = c.req.param("currency") as CurrencyType;
    
    const balance = await fiatBalanceService.getUserFiatBalanceByCurrency(userId, currency);
    
    return c.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error getting user fiat balance by currency:", error);
    
    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    throw new HTTPException(500, { message: "Failed to get user fiat balance" });
  }
};

// Create a new fiat balance (admin)
export const createFiatBalance = async (c: Context) => {
  try {
    const data = await c.req.json();
    
    const balance = await fiatBalanceService.createFiatBalance(data);
    
    return c.json({
      success: true,
      data: balance,
    }, 201);
  } catch (error) {
    console.error("Error creating fiat balance:", error);
    
    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }
    
    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    throw new HTTPException(500, { message: "Failed to create fiat balance" });
  }
};

// Update a fiat balance (admin)
export const updateFiatBalance = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();
    
    const balance = await fiatBalanceService.updateFiatBalance(id, data);
    
    return c.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error updating fiat balance:", error);
    
    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }
    
    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    throw new HTTPException(500, { message: "Failed to update fiat balance" });
  }
};

// Add to a user's fiat balance (admin)
export const addToFiatBalance = async (c: Context) => {
  try {
    const userId = c.req.param("userId");
    const currency = c.req.param("currency") as CurrencyType;
    const { amount, description } = await c.req.json();
    
    const balance = await fiatBalanceService.addToFiatBalance(userId, currency, amount, description);
    
    return c.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error adding to fiat balance:", error);
    
    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }
    
    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    throw new HTTPException(500, { message: "Failed to add to fiat balance" });
  }
};

// Subtract from a user's fiat balance (admin)
export const subtractFromFiatBalance = async (c: Context) => {
  try {
    const userId = c.req.param("userId");
    const currency = c.req.param("currency") as CurrencyType;
    const { amount, description } = await c.req.json();
    
    const balance = await fiatBalanceService.subtractFromFiatBalance(userId, currency, amount, description);
    
    return c.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error subtracting from fiat balance:", error);
    
    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }
    
    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    throw new HTTPException(500, { message: "Failed to subtract from fiat balance" });
  }
};

// Add to the authenticated user's fiat balance
export const addToMyFiatBalance = async (c: Context) => {
  try {
    const userId = c.get("userId");
    const currency = c.req.param("currency") as CurrencyType;
    const { amount, description } = await c.req.json();
    
    const balance = await fiatBalanceService.addToFiatBalance(userId, currency, amount, description);
    
    return c.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error adding to user's fiat balance:", error);
    
    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }
    
    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    throw new HTTPException(500, { message: "Failed to add to fiat balance" });
  }
};

// Subtract from the authenticated user's fiat balance
export const subtractFromMyFiatBalance = async (c: Context) => {
  try {
    const userId = c.get("userId");
    const currency = c.req.param("currency") as CurrencyType;
    const { amount, description } = await c.req.json();
    
    const balance = await fiatBalanceService.subtractFromFiatBalance(userId, currency, amount, description);
    
    return c.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error subtracting from user's fiat balance:", error);
    
    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }
    
    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    throw new HTTPException(500, { message: "Failed to subtract from fiat balance" });
  }
};

// Create a fiat balance transaction
export const createFiatBalanceTransaction = async (c: Context) => {
  try {
    const { userId, currency, accountId, amount, description, transactionType } = await c.req.json();  

    const result = await fiatBalanceService.createFiatBalanceTransaction(userId, currency, accountId, amount, transactionType, description  );

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error creating fiat balance transaction:", error);
    
    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }
    
    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    throw new HTTPException(500, { message: "Failed to create fiat balance transaction" });
  }
};

// Transfer between the authenticated user's fiat balances
export const transferBetweenMyFiatBalances = async (c: Context) => {
  try {
    const userId = c.get("userId");
    const { fromCurrency, toCurrency, amount, description } = await c.req.json();
    
    const result = await fiatBalanceService.transferBetweenFiatBalances(
      userId,
      fromCurrency,
      toCurrency,
      amount,
      description
    );
    
    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error transferring between fiat balances:", error);
    
    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }
    
    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    throw new HTTPException(500, { message: "Failed to transfer between fiat balances" });
  }
};

// Delete a fiat balance (admin)
export const deleteFiatBalance = async (c: Context) => {
  try {
    const id = c.req.param("id");
    
    await fiatBalanceService.deleteFiatBalance(id);
    
    return c.json({
      success: true,
      message: "Fiat balance deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting fiat balance:", error);
    
    if (error instanceof NotFoundError) {
      throw new HTTPException(404, { message: error.message });
    }
    
    if (error instanceof BadRequestError) {
      throw new HTTPException(400, { message: error.message });
    }
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    throw new HTTPException(500, { message: "Failed to delete fiat balance" });
  }
}; 