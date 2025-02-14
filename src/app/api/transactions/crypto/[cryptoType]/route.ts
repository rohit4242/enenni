import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import db from "@/lib/db"
import { CryptoType, TransactionType } from "@prisma/client"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ cryptoType: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const { cryptoType } = await context.params

    // Validate if the crypto type is valid
    if (!Object.values(CryptoType).includes(cryptoType.toUpperCase() as CryptoType)) {
      return new Response(JSON.stringify({ error: "Invalid crypto type" }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    // Fetch all transactions for the specified crypto
    const transactions = await db.transaction.findMany({
      where: {
        userId: session.user.id,
        cryptoType: cryptoType.toUpperCase() as CryptoType,
        type: {
          in: [
            TransactionType.CRYPTO_DEPOSIT,
            TransactionType.CRYPTO_WITHDRAWAL,
            TransactionType.BUY_CRYPTO,
            TransactionType.SELL_CRYPTO,
          ],
        },
      },
      include: {
        cryptoBalance: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return new Response(JSON.stringify(transactions), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error("[TRANSACTIONS_BY_CRYPTO_GET]", error)
    return new Response(JSON.stringify({ error: "Failed to fetch transactions" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
} 