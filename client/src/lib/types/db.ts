// Authentication Types
export type Account = {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
  user: User;
};

export type Session = {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user: User;
};

export type VerificationToken = {
  id: string;
  email: string;
  token: string;
  expires: Date;
};

export type PasswordResetToken = {
  id: string;
  email: string;
  token: string;
  expires: Date;
};

export type TwoFactorToken = {
  id: string;
  email: string;
  token: string;
  expires: Date;
};

export type TwoFactorConfirmation = {
  id: string;
  userId: string;
  user: User;
};

// Enum Types
export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum QuoteStatus {
  ACTIVE = "ACTIVE",
  ACCEPTED = "ACCEPTED",
  EXPIRED = "EXPIRED",
}

export enum TransactionType {
  FIAT_DEPOSIT = "FIAT_DEPOSIT",
  FIAT_WITHDRAWAL = "FIAT_WITHDRAWAL",
  CRYPTO_DEPOSIT = "CRYPTO_DEPOSIT",
  CRYPTO_WITHDRAWAL = "CRYPTO_WITHDRAWAL",
  BUY_CRYPTO = "BUY_CRYPTO",
  SELL_CRYPTO = "SELL_CRYPTO",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum CurrencyType {
  USD = "USD",
  AED = "AED",
}

export enum CryptoType {
  USDT = "USDT",
  USDC = "USDC",
  BTC = "BTC",
  ETH = "ETH",
}

export enum OrderStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Core Business Types
export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  password?: string | null;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  kycStatus?: string | null;
  sumsubApplicantId?: string | null;
  kycSubmittedAt?: Date | null;
  kycApprovedAt?: Date | null;
  isTwoFactorEnabled: boolean;
  role?: Role;
  mfaEnabled: boolean;
  mfaSecret?: string | null;
  mfaQrCode?: string | null;
  accounts: Account[];
  sessions: Session[];
  orders: Order[];
  fiatBalances: FiatBalance[];
  cryptoBalances: CryptoBalance[];
  userBankAccounts: UserBankAccount[];
  userCryptoWallets: UserCryptoWallet[];
  transactions: Transaction[];
  twoFactorConfirmation?: TwoFactorConfirmation | null;
};

export type FiatBalance = {
  id: string;
  userId: string;
  user: User;
  currency: CurrencyType;
  balance: number;
  transactions: Transaction[];
};

export type CryptoBalance = {
  id: string;
  userId: string;
  user: User;
  cryptoType: CryptoType;
  balance: number;
  walletAddress?: string | null;
  transactions: Transaction[];
};

export type UserBankAccount = {
  id: string;
  userId: string;
  user: User;
  accountHolderName: string;
  accountNumber?: string | null;
  iban?: string | null;
  bankName: string;
  accountCurrency: CurrencyType;
  bankAddress: string;
  bankCountry: string;
  proofDocumentUrl: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type UserCryptoWallet = {
  id: string;
  userId: string;
  user: User;
  walletAddress: string;
  cryptoType: CryptoType;
  nickname?: string | null;
  walletType?: string | null;
  chain?: string | null;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type Transaction = {
  id: string;
  userId: string;
  user: User;
  type: TransactionType;
  status: TransactionStatus;
  fiatAmount?: number | null;
  fiatCurrency?: CurrencyType | null;
  cryptoAmount?: number | null;
  cryptoType?: CryptoType | null;
  transactionHash?: string | null;
  referenceId?: string | null;
  description?: string | null;
  exchangeRate?: number | null;
  fiatBalance?: FiatBalance | null;
  cryptoBalance?: CryptoBalance | null;
  fiatBalanceId?: string | null;
  cryptoBalanceId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Order = {
  id: string;
  type: string;
  asset: string;
  quantity: string; // Using string for Decimal
  pricePerToken: string; // Using string for Decimal
  totalAmount: string; // Using string for Decimal
  status: OrderStatus;
  userId: string;
  user: User;
  createdAt: Date;
  currency: string;
  referenceId: string;
};

export type EnenniBankAccount = {
  id: string;
  currency: CurrencyType;
  accountName: string;
  accountNumber: string;
  iban: string;
  bankName: string;
  swiftCode: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}; 