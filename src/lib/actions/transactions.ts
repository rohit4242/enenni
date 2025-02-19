"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import {
  CryptoType,
  CurrencyType,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";
import { generateReferenceId } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { transactionSchema, TransactionFormValues } from "@/lib/schemas/transaction";

// Define transaction types as constants
const FIAT_DEPOSIT = "FIAT_DEPOSIT";
const FIAT_WITHDRAWAL = "FIAT_WITHDRAWAL";
const CRYPTO_DEPOSIT = "CRYPTO_DEPOSIT";
const CRYPTO_WITHDRAWAL = "CRYPTO_WITHDRAWAL";

// Define the return type for the transaction submission
export interface SubmitTransactionResponse {
  success: boolean;
  error?: string;
  transaction?: Transaction;
}

/**
 * Retrieves transactions for the given type and currency.
 */
export async function getTransactions(type: "fiat" | "crypto", currency: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const transactions = await db.transaction.findMany({
      where: {
        userId: session.user.id,
        ...(type === "fiat"
          ? {
              fiatCurrency: currency as CurrencyType,
              type: {
                in: [TransactionType.FIAT_DEPOSIT, TransactionType.FIAT_WITHDRAWAL],
              },
            }
          : {
              cryptoType: currency as CryptoType,
              type: {
                in: [TransactionType.CRYPTO_DEPOSIT, TransactionType.CRYPTO_WITHDRAWAL],
              },
            }),
      },
      include: {
        fiatBalance: type === "fiat",
        cryptoBalance: type === "crypto",
      },
      orderBy: { createdAt: "desc" },
    });

    return transactions;
  } catch (error) {
    console.error("[GET_TRANSACTIONS]", error);
    throw new Error("Failed to fetch transactions");
  }
}

/**
 * Handles fiat deposit/withdrawal within a transaction.
 */
async function handleFiatTransaction(data: {
  transactionType: typeof FIAT_DEPOSIT | typeof FIAT_WITHDRAWAL;
  amount: string;
  currency: CurrencyType;
  bankAccountId: string;
  description?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const amountValue = parseFloat(data.amount);
  if (isNaN(amountValue) || amountValue <= 0) throw new Error("Invalid amount");

  const userId = session.user.id;

  // Check bank account belongs to the user
  const bankAccount = await db.userBankAccount.findFirst({
    where: {
      id: data.bankAccountId,
      userId,
    },
  });
  if (!bankAccount) throw new Error("Invalid bank account");

  // Execute transaction within a DB transaction for atomicity
  const newTransaction = await db.$transaction(async (tx) => {
    const currentBalance = await tx.fiatBalance.findFirst({
      where: {
        userId,
        currency: data.currency,
      },
    });

    if (data.transactionType === TransactionType.FIAT_WITHDRAWAL) {
      const currentAmount = currentBalance?.balance || 0;
      if (currentAmount < amountValue) throw new Error("Insufficient balance");
    }

    return await tx.transaction.create({
      data: {
        type: data.transactionType,
        fiatAmount: amountValue,
        fiatCurrency: data.currency,
        userId,
        status: TransactionStatus.PENDING,
        description:
          data.description ||
          `${data.currency} ${
            data.transactionType === TransactionType.FIAT_DEPOSIT ? "Deposit" : "Withdrawal"
          }`,
        referenceId: generateReferenceId({ prefix: "FIAT", length: 8 }),
        fiatBalanceId: currentBalance?.id || null,
        transactionHash: `${data.currency}_${Date.now()}`,
      },
    });
  });

  revalidatePath(`/balances/${data.currency.toLowerCase()}`);
  return newTransaction;
}

/**
 * Handles crypto deposit.
 */
async function handleCryptoDeposit(data: {
  transactionType: typeof CRYPTO_DEPOSIT;
  amount: string;
  cryptoType: CryptoType;
  walletAddress: string;
  network: string;
  description?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const amountValue = parseFloat(data.amount);
  if (isNaN(amountValue) || amountValue <= 0) throw new Error("Invalid amount");

  const userId = session.user.id;

  // Wrap wallet lookup/creation and transaction insertion together
  const newTransaction = await db.$transaction(async (tx) => {
    // Find an existing wallet or create one if not present.
    let cryptoBalance = await tx.cryptoBalance.findFirst({
      where: {
        userId,
        cryptoType: data.cryptoType,
        walletAddress: data.walletAddress,
      },
    });

    if (!cryptoBalance) {
      cryptoBalance = await tx.cryptoBalance.create({
        data: {
          userId,
          cryptoType: data.cryptoType,
          walletAddress: data.walletAddress,
        },
      });
    }

    // Create the transaction record using the scalar foreign key.
    return await tx.transaction.create({
      data: {
        type: data.transactionType,
        cryptoAmount: amountValue,
        cryptoType: data.cryptoType,
        userId,
        status: TransactionStatus.PENDING,
        description: data.description || `${data.cryptoType} Deposit`,
        referenceId: generateReferenceId({ prefix: "CRYPTO", length: 8 }),
        cryptoBalanceId: cryptoBalance.id,
        transactionHash: `${data.cryptoType}_${Date.now()}`,
      },
    });
  });

  revalidatePath(`/balances/${data.cryptoType.toLowerCase()}`);
  return newTransaction;
}

/**
 * Handles crypto withdrawal.
 */
async function handleCryptoWithdrawal(data: {
  transactionType: typeof CRYPTO_WITHDRAWAL;
  amount: string;
  cryptoType: CryptoType;
  destinationAddress: string;
  network: string;
  memo?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const amountValue = parseFloat(data.amount);
  if (isNaN(amountValue) || amountValue <= 0) throw new Error("Invalid amount");

  const userId = session.user.id;
  // Create the crypto withdrawal transaction.
  const newTransaction = await db.transaction.create({
    data: {
      type: data.transactionType,
      cryptoAmount: amountValue,
      cryptoType: data.cryptoType,
      userId,
      status: TransactionStatus.PENDING,
      description: data.memo || `${data.cryptoType} Withdrawal`,
      referenceId: generateReferenceId({ prefix: "CRYPTO", length: 8 }),
      // Here you may want to link to an existing crypto balance or wallet.
      transactionHash: `${data.cryptoType}_${Date.now()}`,
    },
  });

  revalidatePath(`/balances/${data.cryptoType.toLowerCase()}`);
  return newTransaction;
}

/**
 * Unified server action that validates the incoming data via a discriminated union
 * and dispatches the specific transaction creation logic.
 */
export async function submitTransaction(data: TransactionFormValues): Promise<SubmitTransactionResponse> {
  // Validate data using the unified discriminated schema.
  const validatedData = transactionSchema.parse(data);

  try {
    if (
      validatedData.transactionType === TransactionType.FIAT_DEPOSIT ||
      validatedData.transactionType === TransactionType.FIAT_WITHDRAWAL
    ) {
      const transaction = await handleFiatTransaction({
        transactionType: validatedData.transactionType,
        amount: validatedData.amount,
        currency: validatedData.currency,
        bankAccountId: validatedData.bankAccountId,
        description: validatedData.description,
      });
      return { success: true, transaction };
    }

    if (validatedData.transactionType === TransactionType.CRYPTO_DEPOSIT) {
      console.log("CRYPTO DEPOSIT");
      const transaction = await handleCryptoDeposit({
        transactionType: validatedData.transactionType,
        amount: validatedData.amount,
        cryptoType: validatedData.cryptoType,
        walletAddress: validatedData.walletAddress,
        network: validatedData.network,
        description: validatedData.description,
      });
      console.log("CRYPTO DEPOSIT TRANSACTION", transaction);
      return { success: true, transaction };
    }

    if (validatedData.transactionType === TransactionType.CRYPTO_WITHDRAWAL) {
      console.log("CRYPTO WITHDRAWAL");
      const transaction = await handleCryptoWithdrawal({
        transactionType: validatedData.transactionType,
        amount: validatedData.amount,
        cryptoType: validatedData.cryptoType,
        destinationAddress: validatedData.destinationAddress,
        network: validatedData.network,
        memo: validatedData.memo,
      });
      return { success: true, transaction };
    }

    throw new Error("Unsupported transaction type");
  } catch (error: any) {
    return { success: false, error: error.message || "Transaction failed" };
  }
}

