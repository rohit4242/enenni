import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as enenniBankAccountHandler from '../handlers/enenni-bank-account.handler';
import { 
  createEnenniBankAccountSchema,
  updateEnenniBankAccountSchema,
  filterEnenniBankAccountSchema
} from '../schemas/enenni-bank-account.schema';
import { authenticate } from '../middleware/auth';

const enenniBankAccountRouter = new Hono();

// All routes require authentication and admin privileges
enenniBankAccountRouter.use('/*', authenticate);

// Admin routes for Enenni bank accounts
enenniBankAccountRouter.get('/', enenniBankAccountHandler.getAllEnenniBankAccounts);
enenniBankAccountRouter.get('/:id', enenniBankAccountHandler.getEnenniBankAccountById);
enenniBankAccountRouter.post('/', zValidator('json', createEnenniBankAccountSchema), enenniBankAccountHandler.createEnenniBankAccount);
enenniBankAccountRouter.put('/:id', zValidator('json', updateEnenniBankAccountSchema), enenniBankAccountHandler.updateEnenniBankAccount);
enenniBankAccountRouter.delete('/:id', enenniBankAccountHandler.deleteEnenniBankAccount);
enenniBankAccountRouter.patch('/:id/toggle-status', enenniBankAccountHandler.toggleEnenniBankAccountStatus);

export default enenniBankAccountRouter;
