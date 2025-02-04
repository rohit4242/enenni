import prisma from "@/lib/db"

export async function getWalletByCurrency(userId: string, currency: string) {
  return await prisma.wallet.findFirst({
    where: {
      userId,
      currency: currency.toUpperCase(),
    },
    include: {
      transactions: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })
} 