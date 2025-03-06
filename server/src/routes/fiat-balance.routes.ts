import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as fiatBalanceHandler from '../handlers/fiat-balance.handler';
import { 
  createFiatBalanceSchema,
  updateFiatBalanceSchema,
  adjustBalanceSchema,
  transferBalanceSchema,
  createFiatBalanceTransactionSchema
} from "../schemas/fiat-balance.schema";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/auth";
const fiatBalanceRouter = new Hono();

// All routes require authentication
fiatBalanceRouter.use("/*", authenticate);

// User routes
fiatBalanceRouter.get('/my', fiatBalanceHandler.getUserFiatBalances);
fiatBalanceRouter.get('/my/:currency', fiatBalanceHandler.getUserFiatBalanceByCurrency);
fiatBalanceRouter.post('/my/:currency/add', zValidator('json', adjustBalanceSchema), fiatBalanceHandler.addToMyFiatBalance);
fiatBalanceRouter.post('/my/:currency/subtract', zValidator('json', adjustBalanceSchema), fiatBalanceHandler.subtractFromMyFiatBalance);
fiatBalanceRouter.post('/my/transfer', zValidator('json', transferBalanceSchema), fiatBalanceHandler.transferBetweenMyFiatBalances);
fiatBalanceRouter.post('/create', zValidator('json', createFiatBalanceSchema), fiatBalanceHandler.createFiatBalance);
fiatBalanceRouter.post('/transaction/:currency', zValidator('json', createFiatBalanceTransactionSchema), fiatBalanceHandler.createFiatBalanceTransaction);

// Admin routes
fiatBalanceRouter.use('/admin/*', requireAdmin);
fiatBalanceRouter.get('/admin', fiatBalanceHandler.getAllFiatBalances);
fiatBalanceRouter.get('/admin/:id', fiatBalanceHandler.getFiatBalanceById);
fiatBalanceRouter.put('/admin/:id', zValidator('json', updateFiatBalanceSchema), fiatBalanceHandler.updateFiatBalance);
fiatBalanceRouter.delete('/admin/:id', fiatBalanceHandler.deleteFiatBalance);
fiatBalanceRouter.post('/admin/user/:userId/:currency/add', zValidator('json', adjustBalanceSchema), fiatBalanceHandler.addToFiatBalance);
fiatBalanceRouter.post('/admin/user/:userId/:currency/subtract', zValidator('json', adjustBalanceSchema), fiatBalanceHandler.subtractFromFiatBalance);

export default fiatBalanceRouter; 