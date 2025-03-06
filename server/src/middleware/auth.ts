import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { jwtVerify } from '../utils/jwt';
import { AuthenticationError, AuthorizationError } from '../errors/AppError';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

export const authenticate: MiddlewareHandler = async (c, next) => {
  // Get token from cookies or Authorization header
  let token = getCookie(c, 'token');
  
  // If not in cookie, check Authorization header
  const authHeader = c.req.header('Authorization');
  if (!token && authHeader) {
    token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;
  }

  if (!token) {
    throw new AuthenticationError('Authentication token is missing');
  }

  try {
    // Verify the token
    const payload = await jwtVerify(token);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Set the user in the context
    c.set('user', user);
    
    await next();
  } catch (error) {
    console.error('Token verification error:', error);
    throw new AuthenticationError('Invalid or expired token');
  }
};

export const requireAdmin: MiddlewareHandler = async (c, next) => {
  const user = c.get('user');
  
  if (!user) {
    throw new AuthenticationError('Authentication required for admin access');
  }
  
  if (user.role !== Role.ADMIN) {
    throw new AuthorizationError('Admin access required');
  }
  
  await next();
}; 