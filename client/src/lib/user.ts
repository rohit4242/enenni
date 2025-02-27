import  db  from "./db"
import { CryptoType, CurrencyType } from "@prisma/client"


function generateWalletAddress(cryptoType: CryptoType) {
  // TODO: Implement wallet address generation for the given crypto type randomly
  const cryptoPrefixes = {
    [CryptoType.BTC]: 'bc1q',
    [CryptoType.ETH]: '0x',
    [CryptoType.USDT]: 'T',
    [CryptoType.USDC]: '0x'
  };

  const prefix = cryptoPrefixes[cryptoType];
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomLength = cryptoType === CryptoType.BTC ? 33 : 40;
  
  let address = prefix;
  for (let i = 0; i < randomLength - prefix.length; i++) {
    address += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return address;
}

export async function initializeUserBalances(userId: string) {
  // Initialize crypto balances
  const cryptoTypes = [

    CryptoType.BTC,
    CryptoType.ETH,
    CryptoType.USDT,
    CryptoType.USDC,
  ]

  for (const cryptoType of cryptoTypes) {
    await db.cryptoBalance.create({
      data: {
        userId,
        cryptoType,
        balance: 0,
        walletAddress: generateWalletAddress(cryptoType),
      },
    })
  }

  // Initialize fiat balances
  const fiatCurrencies = [CurrencyType.USD, CurrencyType.AED]

  for (const currency of fiatCurrencies) {
    await db.fiatBalance.create({
      data: {
        userId,
        currency,
        balance: 0,
      },
    })
  }

  // Initialize Enenni bank accounts
  await db.ennenniBankAccount.createMany({
    data: [
      {
        currency: CurrencyType.AED,
        accountName: 'The Rencho Company Limited',
        accountNumber: '4242424242424242',
        iban: 'AE070331234567890123456',
        bankName: 'GHAR NI BANK',
        swiftCode: 'FABAEAAD',
        description: 'For transfer from any bank account.',

      },
      {
        currency: CurrencyType.USD,
        accountName: 'VEDARK SOUK LLC',
        accountNumber: '0987654321',
        iban: 'AE070331234567890123457',
        bankName: 'First Abu Dhabi Bank',
        swiftCode: 'FABAEAAD',
        description: 'For transfer from any bank account, except Zand USD accounts.',
      },
      {
        currency: CurrencyType.USD,
        accountName: 'VEDARK SOUK LLC',
        accountNumber: '5555555555',
        iban: 'AE070331234567890123458',
        bankName: 'First Abu Dhabi Bank',
        swiftCode: 'FABAEAAD',
        description: 'For transfer from your Zand USD bank account.',
      },
    ],
  })
} 

