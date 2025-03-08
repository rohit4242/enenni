export const config = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/enenni?schema=public',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-token-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  app: {
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : undefined,
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'hello@enenni.com',
    fromName: process.env.FROM_NAME || 'Enenni',
    brandColor: process.env.BRAND_COLOR || '#2563EB',
  },
  twoFactor: {
    secret: process.env.TWO_FACTOR_SECRET || 'your-super-secret-two-factor-secret-key',
    period: process.env.TWO_FACTOR_PERIOD || 300, // 5 minutes
    digits: process.env.TWO_FACTOR_DIGITS || 6,
  },
}; 