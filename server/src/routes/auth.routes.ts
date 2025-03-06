import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as authHandler from '../handlers/auth.handler';
import { 
  loginSchema, 
  registerSchema, 
  resetPasswordSchema, 
  newPasswordSchema, 
  verifyEmailSchema, 
  twoFactorSchema,
  resendVerificationSchema
} from '../schemas/auth.schema';
import { authenticate } from '../middleware/auth';

const authRouter = new Hono();

// Public routes
authRouter.post('/register', zValidator('json', registerSchema), authHandler.register);
authRouter.post('/login', zValidator('json', loginSchema), authHandler.login);
authRouter.post('/logout', authHandler.logout);
authRouter.post('/verify-email', zValidator('json', verifyEmailSchema), authHandler.verifyEmail);
authRouter.post('/reset-password', zValidator('json', resetPasswordSchema), authHandler.resetPassword);
authRouter.post('/new-password', zValidator('json', newPasswordSchema), authHandler.newPassword);
authRouter.post('/two-factor', zValidator('json', twoFactorSchema), authHandler.verifyTwoFactorToken);
authRouter.post('/resend-verification', zValidator('json', resendVerificationSchema), authHandler.resendVerification);

// Protected routes
authRouter.get('/me', authenticate, authHandler.me);

export default authRouter; 