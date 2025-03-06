import * as jose from 'jose';
import { config } from '../config';

// Define the JWT payload type with index signature
export interface JwtPayload {
  userId: string;
  email?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

// Sign JWT token
export const jwtSign = async (payload: JwtPayload): Promise<string> => {
  const secret = new TextEncoder().encode(config.jwt.secret);
  
  // Create a jose compatible payload
  const josePayload: jose.JWTPayload = {
    ...payload
  };
  
  return await new jose.SignJWT(josePayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(config.jwt.expiresIn)
    .sign(secret);
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