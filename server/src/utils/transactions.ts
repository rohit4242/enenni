import { CryptoType } from "@prisma/client";

interface ReferenceIdProps {
  prefix: string;
  length: number;
}

export function generateReferenceId({
  prefix,
  length,
}: ReferenceIdProps): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random()
    .toString(36)
    .substring(2, length)
    .toUpperCase();
  return `${prefix}-${dateStr}-${randomStr}`;
}


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