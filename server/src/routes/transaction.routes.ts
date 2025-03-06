import { Hono } from "hono";
import {
  getAllTransactions,
  getTransactionsBySpecificCryptoType,
  getTransactionsBySpecificCurrency,
} from "../handlers/transaction.handler";
import { authenticate } from "../middleware/auth";

const transactionRouter = new Hono();

// Apply auth middleware to all routes
transactionRouter.use("*", authenticate);

// Get all transactions with optional filtering
transactionRouter.get("/", getAllTransactions);

// Get transactions by specific crypto type
transactionRouter.get(
  "/crypto/:cryptoType",
  getTransactionsBySpecificCryptoType
);

// Get transactions by specific currency
transactionRouter.get("/currency/:currency", getTransactionsBySpecificCurrency);

export default transactionRouter;
