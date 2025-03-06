import type { Context } from "hono";
import { z } from "zod";
import { CryptoType, CurrencyType } from "@prisma/client";
import {
  getTransactions,
  getTransactionsByCryptoType,
  getTransactionsByCurrency,
} from "../services/transaction.service";
import { transactionFilterSchema } from "../schemas/transaction.schema";
import { BadRequestError, NotFoundError } from "../errors/AppError";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Get all transactions for the authenticated user with optional filtering
 */
export const getAllTransactions = async (c: Context) => {
  try {
    const user = c.get("user");
    
    // Parse and validate query parameters
    const query = c.req.query();
    const validatedFilters = transactionFilterSchema.parse({
      type: query.type,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
    });
    
    const result = await getTransactions(user.id, validatedFilters);
    
    return c.json({
      status: 'success',
      data: {
        transactions: result.transactions,
        pagination: {
          total: result.total,
          page: validatedFilters.page,
          limit: validatedFilters.limit,
          pages: Math.ceil(result.total / validatedFilters.limit),
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ status: 'error', message: error.errors[0].message }, 400);
    }
    
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      return c.json({ status: 'error', message: error.message }, error.statusCode as ContentfulStatusCode);
    }
    
    console.error('Error getting transactions:', error);
    return c.json({ status: 'error', message: 'Failed to get transactions' }, 500);
  }
};

/**
 * Get transactions filtered by crypto type
 */
export const getTransactionsBySpecificCryptoType = async (c: Context) => {
  try {
    const user = c.get("user");
    const cryptoType = c.req.param("cryptoType");

    // Validate crypto type
    if (!Object.values(CryptoType).includes(cryptoType as any)) {
      return c.json({ status: 'error', message: `Invalid crypto type: ${cryptoType}` }, 400);
    }
    
    // Parse pagination parameters
    const query = c.req.query();
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 10;
    
    const result = await getTransactionsByCryptoType(user.id, cryptoType, page, limit);
    
    return c.json({
      status: 'success',
      data: {
        transactions: result.transactions,
        pagination: {
          total: result.total,
          page,
          limit,
          pages: Math.ceil(result.total / limit),
        },
      },
    });
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      return c.json({ status: 'error', message: error.message }, error.statusCode as ContentfulStatusCode);
    }
    
    console.error('Error getting transactions by crypto type:', error);
    return c.json({ status: "error", message: "Failed to get transactions" }, 500);
  }
};

/**
 * Get transactions filtered by currency
 */
export const getTransactionsBySpecificCurrency = async (c: Context) => {
  try {
    const user = c.get("user");
    const currency = c.req.param("currency");

    // Validate currency
    if (!Object.values(CurrencyType).includes(currency as any)) {
      return c.json({ status: 'error', message: `Invalid currency: ${currency}` }, 400);
    }
    
    // Parse pagination parameters
    const query = c.req.query();
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 10;
    
    const result = await getTransactionsByCurrency(user.id, currency, page, limit);
    
    return c.json({
      status: 'success',
      data: {
        transactions: result.transactions,
        pagination: {
          total: result.total,
          page,
          limit,
          pages: Math.ceil(result.total / limit),
        },
      },
    });
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      return c.json({ status: 'error', message: error.message }, error.statusCode as ContentfulStatusCode);
    }
    
    console.error('Error getting transactions by currency:', error);
    return c.json({ status: 'error', message: 'Failed to get transactions' }, 500);
  }
}; 