import * as jose from 'jose';
import { config } from '../config';

// Define the JWT payload type with index signature
export interface JwtPayload {
  userId: string;
  email?: string;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
  [key: string]: any;
}

// Sign JWT token
export const jwtSign = async (payload: JwtPayload, type: 'access' | 'refresh' = 'access'): Promise<string> => {
  const secret = new TextEncoder().encode(config.jwt.secret);
  
  // Create a jose compatible payload
  const josePayload: jose.JWTPayload = {
    ...payload,
    type,
    userId: payload.userId,
  };
  
  const expiresIn = type === 'access' 
    ? config.jwt.expiresIn 
    : config.jwt.refreshExpiresIn;
  
  return await new jose.SignJWT(josePayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
};

// Generate both access and refresh tokens
export const generateTokenPair = async (payload: Omit<JwtPayload, 'type'>): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  const accessToken = await jwtSign({ ...payload, type: 'access', userId: payload.userId }, 'access');
  const refreshToken = await jwtSign({ ...payload, type: 'refresh', userId: payload.userId }, 'refresh');
  
  return { accessToken, refreshToken };
};

// Verify JWT token
export const jwtVerify = async (token: string): Promise<JwtPayload> => {
  const secret = new TextEncoder().encode(config.jwt.secret);
  
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};