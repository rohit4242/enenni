import { CryptoType, TransactionStatus, TransactionType } from "@prisma/client";
import { NotFoundError, BadRequestError } from "../errors/AppError";
import prisma from "../lib/prisma";
import { generateReferenceId } from "../utils/transactions";

/**
 * Get all crypto balances with optional filtering
 */
export const getAllCryptoBalances = async (filters: {
  cryptoType?: CryptoType;
  minBalance?: number;
  maxBalance?: number;
  hasWalletAddress?: boolean;
}) => {
  const { cryptoType, minBalance, maxBalance, hasWalletAddress } = filters;

  const where: any = {};

  if (cryptoType) {
    where.cryptoType = cryptoType;
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

  if (hasWalletAddress !== undefined) {
    if (hasWalletAddress) {
      where.walletAddress = {
        not: null,
      };
    } else {
      where.walletAddress = null;
    }
  }

  return prisma.cryptoBalance.findMany({
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
 * Get a crypto balance by ID
 */
export const getCryptoBalanceById = async (id: string) => {
  const balance = await prisma.cryptoBalance.findUnique({
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
    throw new NotFoundError("Crypto balance not found");
  }

  return balance;
};

/**
 * Get a user's crypto balance by crypto type
 */
export const getUserCryptoBalanceByCryptoType = async (
  userId: string,
  cryptoType: CryptoType
) => {
  const balance = await prisma.cryptoBalance.findUnique({
    where: {
      userId_cryptoType: {
        userId,
        cryptoType,
      },
    },
  });

  if (!balance) {
    throw new NotFoundError(`${cryptoType} balance not found for this user`);
  }

  return balance;
};

/**
 * Get all crypto balances for a user
 */
export const getUserCryptoBalances = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return prisma.cryptoBalance.findMany({
    where: { userId },
  });
};

/**
 * Create a new crypto balance
 */
export const createCryptoBalance = async (data: {
  userId: string;
  cryptoType: CryptoType;
  balance?: number;
  walletAddress?: string;
}) => {
  const { userId, cryptoType, balance = 0, walletAddress } = data;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Check if balance already exists
  const existingBalance = await prisma.cryptoBalance.findUnique({
    where: {
      userId_cryptoType: {
        userId,
        cryptoType,
      },
    },
  });

  if (existingBalance) {
    throw new BadRequestError(
      `${cryptoType} balance already exists for this user`
    );
  }

  return prisma.cryptoBalance.create({
    data: {
      userId,
      cryptoType,
      balance,
      walletAddress,
    },
  });
};

/**
 * Update a crypto balance
 */
export const updateCryptoBalance = async (
  id: string,
  data: {
    balance?: number;
    cryptoType?: CryptoType;
    walletAddress?: string;
  }
) => {
  const balance = await prisma.cryptoBalance.findUnique({
    where: { id },
  });

  if (!balance) {
    throw new NotFoundError("Crypto balance not found");
  }

  return prisma.cryptoBalance.update({
    where: { id },
    data,
  });
};

/**
 * Add to a user's crypto balance
 */
export const addToCryptoBalance = async (
  userId: string,
  cryptoType: CryptoType,
  amount: number,
  description?: string
) => {
  if (amount <= 0) {
    throw new BadRequestError("Amount must be positive");
  }

  // Get the balance or create if it doesn't exist
  let balance = await prisma.cryptoBalance.findUnique({
    where: {
      userId_cryptoType: {
        userId,
        cryptoType,
      },
    },
  });

  if (!balance) {
    balance = await prisma.cryptoBalance.create({
      data: {
        userId,
        cryptoType,
        balance: 0,
      },
    });
  }

  // Update the balance
  const updatedBalance = await prisma.cryptoBalance.update({
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
      type: TransactionType.CRYPTO_DEPOSIT,
      status: TransactionStatus.APPROVED,
      cryptoAmount: amount,
      cryptoType: cryptoType,
      description: description || `Added ${amount} ${cryptoType} to balance`,
      cryptoBalanceId: balance.id,
    },
  });

  return updatedBalance;
};

/**
 * Subtract from a user's crypto balance
 */
export const subtractFromCryptoBalance = async (
  userId: string,
  cryptoType: CryptoType,
  amount: number,
  description?: string
) => {
  if (amount <= 0) {
    throw new BadRequestError("Amount must be positive");
  }

  // Get the balance
  const balance = await prisma.cryptoBalance.findUnique({
    where: {
      userId_cryptoType: {
        userId,
        cryptoType,
      },
    },
  });

  if (!balance) {
    throw new NotFoundError(`${cryptoType} balance not found for this user`);
  }

  // Check if there's enough balance
  if (balance.balance < amount) {
    throw new BadRequestError(`Insufficient ${cryptoType} balance`);
  }

  // Update the balance
  const updatedBalance = await prisma.cryptoBalance.update({
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
      type: TransactionType.CRYPTO_WITHDRAWAL,
      status: TransactionStatus.APPROVED,
      cryptoAmount: -amount,
      cryptoType,
      description:
        description || `Subtracted ${amount} ${cryptoType} from balance`,
      cryptoBalanceId: balance.id,
    },
  });

  return updatedBalance;
};

/**
 * Create a crypto balance transaction
 */
export const createCryptoBalanceTransaction = async (
  userId: string,
  cryptoType: CryptoType,
  amount: number,
  transactionType: TransactionType,
  walletAddress: string,
  description?: string,
  network?: string
) => {
  if (amount <= 0) {
    throw new BadRequestError("Amount must be positive");
  }

  // Get the balance or create if it doesn't exist
  let cryptoBalance = await prisma.cryptoBalance.findFirst({
    where: {
      userId,
      cryptoType,
    },
  });

  if (!cryptoBalance) {
    cryptoBalance = await prisma.cryptoBalance.create({
      data: {
        userId,
        cryptoType,
        balance: 0,
        walletAddress,
      },
    });
  } else if (walletAddress && !cryptoBalance.walletAddress) {
    // If we found a balance without a wallet address but now have one, update it
    cryptoBalance = await prisma.cryptoBalance.update({
      where: { id: cryptoBalance.id },
      data: { walletAddress },
    });
  }

  // Create a transaction record
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: transactionType,
      status: TransactionStatus.PENDING,
      cryptoAmount: amount,
      cryptoType,
      description:
        description || `Transaction ${transactionType} ${amount} ${cryptoType}`,
      cryptoBalanceId: cryptoBalance.id,
      transactionHash: `${cryptoType}_${Date.now()}`,
      referenceId: generateReferenceId({
        prefix: cryptoType,
        length: 10,
      }),
    },
  });

  return transaction;
};

/**
 * Transfer between a user's crypto balances
 */
export const transferBetweenCryptoBalances = async (
  userId: string,
  fromCryptoType: CryptoType,
  toCryptoType: CryptoType,
  amount: number,
  description?: string
) => {
  if (amount <= 0) {
    throw new BadRequestError("Amount must be positive");
  }

  if (fromCryptoType === toCryptoType) {
    throw new BadRequestError(
      "Source and destination crypto types must be different"
    );
  }

  // Start a transaction
  return prisma.$transaction(async (tx) => {
    // Get the source balance
    const sourceBalance = await tx.cryptoBalance.findUnique({
      where: {
        userId_cryptoType: {
          userId,
          cryptoType: fromCryptoType,
        },
      },
    });

    if (!sourceBalance) {
      throw new NotFoundError(
        `${fromCryptoType} balance not found for this user`
      );
    }

    // Check if there's enough balance
    if (sourceBalance.balance < amount) {
      throw new BadRequestError(`Insufficient ${fromCryptoType} balance`);
    }

    // Get the destination balance or create if it doesn't exist
    let destBalance = await tx.cryptoBalance.findUnique({
      where: {
        userId_cryptoType: {
          userId,
          cryptoType: toCryptoType,
        },
      },
    });

    if (!destBalance) {
      destBalance = await tx.cryptoBalance.create({
        data: {
          userId,
          cryptoType: toCryptoType,
          balance: 0,
        },
      });
    }

    // Update the source balance
    await tx.cryptoBalance.update({
      where: { id: sourceBalance.id },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    // Update the destination balance
    const updatedDestBalance = await tx.cryptoBalance.update({
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
        type: TransactionType.CRYPTO_WITHDRAWAL,
        status: TransactionStatus.APPROVED,
        cryptoAmount: -amount,
        cryptoType: fromCryptoType,
        description:
          description ||
          `Transferred ${amount} ${fromCryptoType} to ${toCryptoType}`,
        cryptoBalanceId: sourceBalance.id,
      },
    });

    await tx.transaction.create({
      data: {
        userId,
        type: TransactionType.CRYPTO_DEPOSIT,
        status: TransactionStatus.APPROVED,
        cryptoAmount: amount,
        cryptoType: toCryptoType,
        description:
          description ||
          `Received ${amount} ${toCryptoType} from ${fromCryptoType}`,
        cryptoBalanceId: destBalance.id,
      },
    });

    return {
      sourceBalance: await tx.cryptoBalance.findUnique({
        where: { id: sourceBalance.id },
      }),
      destinationBalance: updatedDestBalance,
    };
  });
};

/**
 * Update wallet address for a crypto balance
 */
export const updateWalletAddress = async (
  id: string,
  walletAddress: string
) => {
  const balance = await prisma.cryptoBalance.findUnique({
    where: { id },
  });

  if (!balance) {
    throw new NotFoundError("Crypto balance not found");
  }

  return prisma.cryptoBalance.update({
    where: { id },
    data: {
      walletAddress,
    },
  });
};

/**
 * Delete a crypto balance
 */
export const deleteCryptoBalance = async (id: string) => {
  const balance = await prisma.cryptoBalance.findUnique({
    where: { id },
    include: {
      transactions: true,
    },
  });

  if (!balance) {
    throw new NotFoundError("Crypto balance not found");
  }

  // Check if there are any transactions
  if (balance.transactions.length > 0) {
    throw new BadRequestError(
      "Cannot delete balance with associated transactions"
    );
  }

  return prisma.cryptoBalance.delete({
    where: { id },
  });
};
