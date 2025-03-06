import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as userHandler from '../handlers/user.handler';
import { 
  userProfileSchema, 
  updatePasswordSchema, 
  updateUserRoleSchema,
  verifyTwoFactorSchema 
} from '../schemas/user.schema';
import { authenticate, requireAdmin } from '../middleware/auth';

const userRouter = new Hono();

// Protected routes (require authentication)
userRouter.use('/*', authenticate);

// User profile routes
userRouter.get('/profile', userHandler.getProfile);
userRouter.patch('/profile', zValidator('json', userProfileSchema), userHandler.updateProfile);
userRouter.post('/password', zValidator('json', updatePasswordSchema), userHandler.updatePassword);

// Two-factor authentication routes
userRouter.post('/two-factor/enable', userHandler.enableTwoFactor);
userRouter.post('/two-factor/disable', userHandler.disableTwoFactor);
userRouter.post('/two-factor/verify', zValidator('json', verifyTwoFactorSchema), userHandler.verifyTwoFactor);

// Admin routes (require admin role)
userRouter.get('/admin/users', requireAdmin, userHandler.getAllUsers);
userRouter.get('/admin/users/:id', requireAdmin, userHandler.getUserById);
userRouter.patch('/admin/users/role', requireAdmin, zValidator('json', updateUserRoleSchema), userHandler.updateUserRole);

export default userRouter; 