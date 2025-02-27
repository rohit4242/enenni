const { PrismaClient, TransactionStatus, TransactionType, CryptoType, CurrencyType } = require('@prisma/client')
const { hash } = require('bcryptjs')

const db = new PrismaClient()

async function main() {
    // Create test user if not exists
    const hashedPassword = await hash('password123', 12)
    const user = await db.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
      },
    })
  
    // Create crypto balances
    const cryptoBalances = [
      { cryptoType: CryptoType.BTC, balance: 2.5 },
      { cryptoType: CryptoType.ETH, balance: 15.7 },
      { cryptoType: CryptoType.USDT, balance: 10000 },
      { cryptoType: CryptoType.USDC, balance: 15000 },
    ]
  
    for (const crypto of cryptoBalances) {
      const balance = await db.cryptoBalance.upsert({
        where: {
          userId_cryptoType: {
            userId: user.id,
            cryptoType: crypto.cryptoType,
          },
        },
        update: { balance: crypto.balance },
        create: {
          userId: user.id,
          cryptoType: crypto.cryptoType,
          balance: crypto.balance,
        },
      })
  
      // Create crypto transactions
      const transactions = [
        {
          type: TransactionType.CRYPTO_DEPOSIT,
          cryptoAmount: crypto.balance * 0.4,
          cryptoType: crypto.cryptoType,
          status: TransactionStatus.COMPLETED,
          userId: user.id,
          transactionHash: `0x${crypto.cryptoType}_${Date.now()}_1`,
          referenceId: `DEP_${crypto.cryptoType}_${Date.now()}_1`,
          description: `${crypto.cryptoType} Deposit`,
        },
        {
          type: TransactionType.CRYPTO_WITHDRAWAL,
          cryptoAmount: crypto.balance * 0.1,
          cryptoType: crypto.cryptoType,
          status: TransactionStatus.PENDING,
          userId: user.id,
          transactionHash: `0x${crypto.cryptoType}_${Date.now()}_2`,
          referenceId: `WIT_${crypto.cryptoType}_${Date.now()}_2`,
          description: `${crypto.cryptoType} Withdrawal`,
        },
      ]
  
      for (const tx of transactions) {
        await db.transaction.create({ data: tx })
      }
    }
  
    // Create fiat balances
    const fiatBalances = [
      { currency: CurrencyType.USD, balance: 50000 },
      { currency: CurrencyType.AED, balance: 250000 },
    ]
  
    for (const fiat of fiatBalances) {
      const balance = await db.fiatBalance.upsert({
        where: {
          userId_currency: {
            userId: user.id,
            currency: fiat.currency,
          },
        },
        update: { balance: fiat.balance },
        create: {
          userId: user.id,
          currency: fiat.currency,
          balance: fiat.balance,
        },
      })
  
      // Create fiat transactions
      const transactions = [
        {
          type: TransactionType.FIAT_DEPOSIT,
          fiatAmount: fiat.balance * 0.6,
          fiatCurrency: fiat.currency,
          status: TransactionStatus.COMPLETED,
          userId: user.id,
          transactionHash: `${fiat.currency}_${Date.now()}_1`,
          referenceId: `DEP_${fiat.currency}_${Date.now()}_1`,
          description: `${fiat.currency} Deposit`,
        },
        {
          type: TransactionType.FIAT_WITHDRAWAL,
          fiatAmount: fiat.balance * 0.2,
          fiatCurrency: fiat.currency,
          status: TransactionStatus.PENDING,
          userId: user.id,
          transactionHash: `${fiat.currency}_${Date.now()}_2`,
          referenceId: `WIT_${fiat.currency}_${Date.now()}_2`,
          description: `${fiat.currency} Withdrawal`,
        },
      ]
  
      for (const tx of transactions) {
        await db.transaction.create({ data: tx })
      }
    }
  
    console.log('Seed data created successfully')
  }
  
  main()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await db.$disconnect()
    })