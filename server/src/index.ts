import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import orderRouter from "./routes/order.routes";
import externalBankAccountRouter from "./routes/external-bank-account.routes";
import cryptoWalletRouter from "./routes/crypto-wallet.routes";
import enenniBankAccountRouter from "./routes/enenni-bank-accounts.routes";
import fiatBalanceRouter from "./routes/fiat-balance.routes";
import cryptoBalanceRouter from "./routes/crypto-balance.routes";
import transactionRouter from "./routes/transaction.routes";
// Create the main app
const app = new Hono();

// Apply global middleware
app.use("*", logger());
app.use("*", errorHandler);
app.use(
  "*",
  cors({
    origin: config.app.corsOrigins,
    credentials: true,
  })
);

// Health check endpoint
app.get("/", (c) => c.json({ status: "ok", message: "Enenni API is running" }));

// Register routes
app.route("/api/auth", authRouter);
app.route("/api/users", userRouter);
app.route("/api/external-bank-accounts", externalBankAccountRouter);
app.route("/api/crypto-wallets", cryptoWalletRouter);
app.route("/api/enenni-bank-accounts", enenniBankAccountRouter);
app.route("/api/orders", orderRouter);
app.route("/api/fiat-balances", fiatBalanceRouter);
app.route("/api/crypto-balances", cryptoBalanceRouter);
app.route("/api/transactions", transactionRouter);

// Start the server
const port = Number(config.app.port);

export default {
  port,
  fetch: app.fetch,
};
