import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as externalBankAccountHandler from '../handlers/external-bank-account.handler';
import { 
  createExternalBankAccountSchema,
  updateExternalBankAccountSchema,
  verifyExternalBankAccountSchema,
  filterExternalBankAccountSchema,
  updateProofDocumentSchema
} from '../schemas/external-bank-account.schema';
import { authenticate, requireAdmin } from '../middleware/auth';

const externalBankAccountRouter = new Hono();

// All routes require authentication
externalBankAccountRouter.use('/*', authenticate);

// User routes
externalBankAccountRouter.get('/', externalBankAccountHandler.getUserBankAccounts);
externalBankAccountRouter.get('/:id', externalBankAccountHandler.getBankAccountById);
externalBankAccountRouter.post('/', zValidator('json', createExternalBankAccountSchema), externalBankAccountHandler.createBankAccount);
externalBankAccountRouter.put('/:id', zValidator('json', updateExternalBankAccountSchema), externalBankAccountHandler.updateBankAccount);
externalBankAccountRouter.delete('/:id', externalBankAccountHandler.deleteBankAccount);
externalBankAccountRouter.put('/:id/proof-document', zValidator('json', updateProofDocumentSchema), externalBankAccountHandler.updateProofDocument);

// Admin routes
externalBankAccountRouter.get('/admin/all', requireAdmin, externalBankAccountHandler.getAllBankAccounts);
externalBankAccountRouter.put('/admin/verify/:id', 
  requireAdmin, 
  zValidator('json', verifyExternalBankAccountSchema), 
  externalBankAccountHandler.verifyBankAccount
);

export default externalBankAccountRouter; 