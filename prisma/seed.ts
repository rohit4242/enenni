const { PrismaClient } = require('@prisma/client')
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
  
    // Create bank accounts
    const bankAccounts = [
      {
        accountHolder: "Test User",
        bankName: "Emirates NBD",
        accountNumber: "1234567890",
        iban: "AE123456789012345678901",
        currency: "AED",
        bankAddress: "Dubai, UAE",
        bankCountry: "United Arab Emirates",
        balance: 50000.00,
        user: { connect: { id: user.id } }
      },
      {
        accountHolder: "Test User",
        bankName: "HSBC",
        accountNumber: "0987654321",
        iban: "GB123456789012345678902",
        currency: "GBP",
        bankAddress: "London, UK",
        bankCountry: "United Kingdom",
        balance: 25000.00,
        user: { connect: { id: user.id } }
      }
    ]

    for (const account of bankAccounts) {
      const bankAccount = await db.bankAccount.upsert({
        where: { iban: account.iban },
        update: {},
        create: account
      })

      // Create transactions for each bank account
      const transactions = [
        {
          type: "DEPOSIT",
          amount: 10000.00,
          currency: account.currency,
          status: "COMPLETED",
          referenceId: `DEP_${account.currency}_${Date.now()}_1`,
          transactionHash: `HASH_${account.currency}_${Date.now()}_1`,
          description: "Initial deposit",
          bankAccount: { connect: { id: bankAccount.id } }
        },
        {
          type: "WITHDRAWAL",
          amount: 5000.00,
          currency: account.currency,
          status: "PENDING",
          referenceId: `WIT_${account.currency}_${Date.now()}_2`,
          transactionHash: `HASH_${account.currency}_${Date.now()}_2`,
          description: "Withdrawal request",
          bankAccount: { connect: { id: bankAccount.id } }
        },
        {
          type: "DEPOSIT",
          amount: 15000.00,
          currency: account.currency,
          status: "COMPLETED",
          referenceId: `DEP_${account.currency}_${Date.now()}_3`,
          transactionHash: `HASH_${account.currency}_${Date.now()}_3`,
          description: "Bank transfer",
          bankAccount: { connect: { id: bankAccount.id } }
        }
      ]

      for (const tx of transactions) {
        await db.transaction.create({
          data: tx
        })
      }
    }
  
    // Currencies to create wallets for
    const currencies = ['BTC', 'ETH', 'USDT', 'USDC']
  
    for (const currency of currencies) {
      // Create wallet if not exists
      const wallet = await db.wallet.upsert({
        where: {
          address: `${currency.toLowerCase()}_address_${user.id}`,
        },
        update: {},
        create: {
          address: `${currency.toLowerCase()}_address_${user.id}`,
          type: "First party",
          status: "APPROVED",
          balance: "1000.50",
          currency: currency,
          userId: user.id,
          nickname: `My ${currency} Wallet`,
        }
      })
  
      // Create transactions with unique referenceIds
      const transactions = [
        {
          amount: "100.00",
          currency: currency,
          type: "DEPOSIT",
          status: "COMPLETED",
          transactionHash: `0xabcd1234_${currency}_${Date.now()}`,
          referenceId: `DEP123_${currency}_${Date.now()}`,
          walletId: wallet.id
        },
        {
          amount: "50.00",
          currency: currency,
          type: "WITHDRAWAL",
          status: "PENDING",
          transactionHash: `0xefgh5678_${currency}_${Date.now()}`,
          referenceId: `WIT456_${currency}_${Date.now()}`,
          walletId: wallet.id
        },
        {
          amount: "500.00",
          currency: currency,
          type: "WITHDRAWAL",
          status: "PENDING",
          transactionHash: `0xefgh567_${currency}_${Date.now()}`,
          referenceId: `WIT4567_${currency}_${Date.now()}`,
          walletId: wallet.id

        },
        {
          amount: "50.00",
          currency: currency,
          type: "DEPOSIT",
          status: "PENDING",
          transactionHash: `0xefgh56789_${currency}_${Date.now()}`,
          referenceId: `DEP1234_${currency}_${Date.now()}`,
          walletId: wallet.id

        }
      ]
  
      for (const tx of transactions) {
        await db.transaction.create({
          data: tx
        })
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