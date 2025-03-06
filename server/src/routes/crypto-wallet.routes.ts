import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as cryptoWalletHandler from '../handlers/crypto-wallet.handler';
import { 
  createCryptoWalletSchema,
  updateCryptoWalletSchema,
  verifyCryptoWalletSchema,
  filterCryptoWalletSchema
} from '../schemas/crypto-wallet.schema';
import { authenticate, requireAdmin } from '../middleware/auth';

const cryptoWalletRouter = new Hono();

// All routes require authentication
cryptoWalletRouter.use('/*', authenticate);

// User routes
cryptoWalletRouter.get('/', cryptoWalletHandler.getUserCryptoWallets);
cryptoWalletRouter.get('/:id', cryptoWalletHandler.getCryptoWalletById);
cryptoWalletRouter.post('/', zValidator('json', createCryptoWalletSchema), cryptoWalletHandler.createCryptoWallet);
cryptoWalletRouter.put('/:id', zValidator('json', updateCryptoWalletSchema), cryptoWalletHandler.updateCryptoWallet);
cryptoWalletRouter.delete('/:id', cryptoWalletHandler.deleteCryptoWallet);

// Admin routes
cryptoWalletRouter.get('/admin/all', requireAdmin, cryptoWalletHandler.getAllCryptoWallets);
cryptoWalletRouter.put('/admin/verify/:id', 
  requireAdmin, 
  zValidator('json', verifyCryptoWalletSchema), 
  cryptoWalletHandler.verifyCryptoWallet
);

export default cryptoWalletRouter;
