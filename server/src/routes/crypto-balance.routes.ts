import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as cryptoBalanceHandler from "../handlers/crypto-balance.handler";
import {
  createCryptoBalanceSchema,
  updateCryptoBalanceSchema,
  adjustBalanceSchema,
  transferBalanceSchema,
  filterCryptoBalanceSchema,
  createCryptoBalanceTransactionSchema,
} from "../schemas/crypto-balance.schema";
import { authenticate, requireAdmin } from "../middleware/auth";
const cryptoBalanceRouter = new Hono();

// All routes require authentication
cryptoBalanceRouter.use("/*", authenticate);

// User routes
cryptoBalanceRouter.get("/my", cryptoBalanceHandler.getUserCryptoBalances);
cryptoBalanceRouter.get(
  "/my/:cryptoType",
  cryptoBalanceHandler.getUserCryptoBalanceByCryptoType
);
cryptoBalanceRouter.post(
  "/my/:cryptoType/add",
  zValidator("json", adjustBalanceSchema),
  cryptoBalanceHandler.addToMyCryptoBalance
);
cryptoBalanceRouter.post(
  "/my/:cryptoType/subtract",
  zValidator("json", adjustBalanceSchema),
  cryptoBalanceHandler.subtractFromMyCryptoBalance
);
cryptoBalanceRouter.post(
  "/my/transfer",
  zValidator("json", transferBalanceSchema),
  cryptoBalanceHandler.transferBetweenMyCryptoBalances
);
cryptoBalanceRouter.put(
  "/my/:cryptoType/wallet-address",
  cryptoBalanceHandler.updateMyWalletAddress
);
cryptoBalanceRouter.post(
  "/create",
  zValidator("json", createCryptoBalanceSchema),
  cryptoBalanceHandler.createCryptoBalance
);
cryptoBalanceRouter.post('/transaction/:cryptoType', zValidator('json', createCryptoBalanceTransactionSchema), cryptoBalanceHandler.createCryptoBalanceTransaction);


// Admin routes
cryptoBalanceRouter.use("/admin/*", requireAdmin);
cryptoBalanceRouter.get("/admin", cryptoBalanceHandler.getAllCryptoBalances);
cryptoBalanceRouter.get(
  "/admin/:id",
  cryptoBalanceHandler.getCryptoBalanceById
);

cryptoBalanceRouter.put(
  "/admin/:id",
  zValidator("json", updateCryptoBalanceSchema),
  cryptoBalanceHandler.updateCryptoBalance
);
cryptoBalanceRouter.delete(
  "/admin/:id",
  cryptoBalanceHandler.deleteCryptoBalance
);
cryptoBalanceRouter.post(
  "/admin/user/:userId/:cryptoType/add",
  zValidator("json", adjustBalanceSchema),
  cryptoBalanceHandler.addToCryptoBalance
);
cryptoBalanceRouter.post(
  "/admin/user/:userId/:cryptoType/subtract",
  zValidator("json", adjustBalanceSchema),
  cryptoBalanceHandler.subtractFromCryptoBalance
);

export default cryptoBalanceRouter;
