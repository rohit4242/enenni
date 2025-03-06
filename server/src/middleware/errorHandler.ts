import type { MiddlewareHandler } from 'hono';
import { AppError, AuthenticationError } from '../errors/AppError';
import { ZodError } from 'zod';

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error details:', error);

    if (error instanceof AuthenticationError) {
      // Always return 401 for authentication errors
      return c.json({
        success: false,
        error: {
          code: error.code || 'AUTHENTICATION_ERROR',
          message: error.message || 'Authentication failed',
        },
      }, 401 as any);
    }

    if (error instanceof AppError) {
      return c.json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      }, error.statusCode as any);
    }

    if (error instanceof ZodError) {
      return c.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors,
        },
      }, 400 as any);
    }

    // Default error response for unknown errors
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
      },
    }, 500 as any);
  }
}; 