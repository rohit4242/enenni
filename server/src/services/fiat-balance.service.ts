import {
  CurrencyType,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";
import { NotFoundError } from "../errors/AppError";
import prisma from "../lib/prisma";
import { generateReferenceId } from "../utils/transactions";

/**
 * Get all fiat balances with optional filtering
 */
export const getAllFiatBalances = async (filters: {
  currency?: CurrencyType;
  minBalance?: number;
  maxBalance?: number;
}) => {
  const { currency, minBalance, maxBalance } = filters;

  const where: any = {};

  if (currency) {
    where.currency = currency;
  }

  if (minBalance !== undefined) {
    where.balance = {
      ...where.balance,
      gte: minBalance,
    };
  }

  if (maxBalance !== undefined) {
    where.balance = {
      ...where.balance,
      lte: maxBalance,
    };
  }

  return prisma.fiatBalance.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Get a fiat balance by ID
 */
export const getFiatBalanceById = async (id: string) => {
  const balance = await prisma.fiatBalance.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!balance) {
    throw new NotFoundError("Fiat balance not found");
  }

  return balance;
};

/**
 * Get a user's fiat balance by currency
 */
export const getUserFiatBalanceByCurrency = async (
  userId: string,
  currency: CurrencyType
) => {
  const balance = await prisma.fiatBalance.findUnique({
    where: {
      userId_currency: {
        userId,
        currency,
      },
    },
  });

  if (!balance) {
    throw new NotFoundError(`${currency} balance not found for this user`);
  }

  return balance;
};

/**
 * Get all fiat balances for a user
 */
export const getUserFiatBalances = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return prisma.fiatBalance.findMany({
    where: { userId },
  });
};

/**
 * Create a new fiat balance
 */
export const createFiatBalance = async (data: {
  userId: string;
  currency: CurrencyType;
  balance?: number;
}) => {
  const { userId, currency, balance = 0 } = data;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Check if balance already exists
  const existingBalance = await prisma.fiatBalance.findUnique({
    where: {
      userId_currency: {
        userId,
        currency,
      },
    },
  });

  if (existingBalance) {
    throw new Error(`${currency} balance already exists for this user`);
  }

  return prisma.fiatBalance.create({
    data: {
      userId,
      currency,
      balance,
    },
  });
};

/**
 * Update a fiat balance
 */
export const updateFiatBalance = async (
  id: string,
  data: {
    balance?: number;
    currency?: CurrencyType;
  }
) => {
  const balance = await prisma.fiatBalance.findUnique({
    where: { id },
  });

  if (!balance) {
    throw new NotFoundError("Fiat balance not found");
  }

  return prisma.fiatBalance.update({
    where: { id },
    data,
  });
};

/**
 * Add to a user's fiat balance
 */
export const addToFiatBalance = async (
  userId: string,
  currency: CurrencyType,
  amount: number,
  description?: string
) => {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }

  // Get the balance or create if it doesn't exist
  let balance = await prisma.fiatBalance.findUnique({
    where: {
      userId_currency: {
        userId,
        currency,
      },
    },
  });

  if (!balance) {
    balance = await prisma.fiatBalance.create({
      data: {
        userId,
        currency,
        balance: 0,
      },
    });
  }

  // Update the balance
  const updatedBalance = await prisma.fiatBalance.update({
    where: { id: balance.id },
    data: {
      balance: {
        increment: amount,
      },
    },
  });

  // Create a transaction record
  await prisma.transaction.create({
    data: {
      userId,
      type: TransactionType.FIAT_DEPOSIT,
      status: TransactionStatus.APPROVED,
      fiatAmount: amount,
      fiatCurrency: currency,
      description: description || `Added ${amount} ${currency} to balance`,
      fiatBalanceId: balance.id,
    },
  });

  return updatedBalance;
};

/**
 * Subtract from a user's fiat balance
 */
export const subtractFromFiatBalance = async (
  userId: string,
  currency: CurrencyType,
  amount: number,
  description?: string
) => {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }

  // Get the balance
  const balance = await prisma.fiatBalance.findUnique({
    where: {
      userId_currency: {
        userId,
        currency,
      },
    },
  });

  if (!balance) {
    throw new NotFoundError(`${currency} balance not found for this user`);
  }

  // Check if there's enough balance
  if (balance.balance < amount) {
    throw new Error(`Insufficient ${currency} balance`);
  }

  // Update the balance
  const updatedBalance = await prisma.fiatBalance.update({
    where: { id: balance.id },
    data: {
      balance: {
        decrement: amount,
      },
    },
  });

  // Create a transaction record
  await prisma.transaction.create({
    data: {
      userId,
      type: TransactionType.FIAT_WITHDRAWAL,
      status: TransactionStatus.APPROVED,
      fiatAmount: -amount,
      fiatCurrency: currency,
      description:
        description || `Subtracted ${amount} ${currency} from balance`,
      fiatBalanceId: balance.id,
    },
  });

  return updatedBalance;
};

/**
 * Create a fiat balance transaction
 */
export const createFiatBalanceTransaction = async (
  userId: string,
  currency: CurrencyType,
  accountId: string,
  amount: number,
  transactionType: TransactionType,
  description?: string
) => {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }
  // Get the balance or create if it doesn't exist
  let bankAccount = await prisma.userBankAccount.findUnique({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!bankAccount) {
    throw new NotFoundError(`Bank account not found for this user`);
  }

  let balance = await prisma.fiatBalance.findUnique({
    where: {
      userId_currency: {
        userId,
        currency,
      },
    },
  });
  if (!balance) {
    balance = await prisma.fiatBalance.create({
      data: {
        userId,
        currency,
        balance: 0,
      },
    });
  }

  // Create a transaction record
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: transactionType,
      status: TransactionStatus.PENDING,
      fiatAmount: amount,
      fiatCurrency: currency,
      description:
        description || `Transaction ${transactionType} ${amount} ${currency}`,
      fiatBalanceId: balance.id,

      transactionHash: `${currency}_${Date.now()}`,
      referenceId: generateReferenceId({
        prefix: currency,
        length: 10,
      }),
    },
  });

  return transaction;
};

/**
 * Transfer between a user's fiat balances
 */
export const transferBetweenFiatBalances = async (
  userId: string,
  fromCurrency: CurrencyType,
  toCurrency: CurrencyType,
  amount: number,
  description?: string
) => {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }

  if (fromCurrency === toCurrency) {
    throw new Error("Source and destination currencies must be different");
  }

  // Start a transaction
  return prisma.$transaction(async (tx) => {
    // Get the source balance
    const sourceBalance = await tx.fiatBalance.findUnique({
      where: {
        userId_currency: {
          userId,
          currency: fromCurrency,
        },
      },
    });

    if (!sourceBalance) {
      throw new NotFoundError(
        `${fromCurrency} balance not found for this user`
      );
    }

    // Check if there's enough balance
    if (sourceBalance.balance < amount) {
      throw new Error(`Insufficient ${fromCurrency} balance`);
    }

    // Get the destination balance or create if it doesn't exist
    let destBalance = await tx.fiatBalance.findUnique({
      where: {
        userId_currency: {
          userId,
          currency: toCurrency,
        },
      },
    });

    if (!destBalance) {
      destBalance = await tx.fiatBalance.create({
        data: {
          userId,
          currency: toCurrency,
          balance: 0,
        },
      });
    }

    // Update the source balance
    await tx.fiatBalance.update({
      where: { id: sourceBalance.id },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    // Update the destination balance
    const updatedDestBalance = await tx.fiatBalance.update({
      where: { id: destBalance.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    // Create transaction records
    await tx.transaction.create({
      data: {
        userId,
        type: TransactionType.FIAT_WITHDRAWAL,
        status: TransactionStatus.APPROVED,
        fiatAmount: -amount,
        fiatCurrency: fromCurrency,
        description:
          description ||
          `Transferred ${amount} ${fromCurrency} to ${toCurrency}`,
        fiatBalanceId: sourceBalance.id,
      },
    });

    await tx.transaction.create({
      data: {
        userId,
        type: TransactionType.FIAT_DEPOSIT,
        status: TransactionStatus.APPROVED,
        fiatAmount: amount,
        fiatCurrency: toCurrency,
        description:
          description ||
          `Received ${amount} ${toCurrency} from ${fromCurrency}`,
        fiatBalanceId: destBalance.id,
      },
    });

    return {
      sourceBalance: await tx.fiatBalance.findUnique({
        where: { id: sourceBalance.id },
      }),
      destinationBalance: updatedDestBalance,
    };
  });
};

/**
 * Delete a fiat balance
 */
export const deleteFiatBalance = async (id: string) => {
  const balance = await prisma.fiatBalance.findUnique({
    where: { id },
    include: {
      transactions: true,
    },
  });

  if (!balance) {
    throw new NotFoundError("Fiat balance not found");
  }

  // Check if there are any transactions
  if (balance.transactions.length > 0) {
    throw new Error("Cannot delete balance with associated transactions");
  }

  return prisma.fiatBalance.delete({
    where: { id },
  });
};
