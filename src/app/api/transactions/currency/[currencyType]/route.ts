import { NextResponse } from "next/server"
import { auth } from "@/auth"
import db from "@/lib/db"
import { CurrencyType, TransactionType } from "@prisma/client"

export async function GET(
  req: Request,
  { params }: { params: { currencyType: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const currencyType = params.currencyType.toUpperCase()

    // Validate if the currency type is valid
    if (!Object.values(CurrencyType).includes(currencyType as CurrencyType)) {
      return new NextResponse("Invalid currency type", { status: 400 })
    }

    // Fetch all transactions for the specified currency
    const transactions = await db.transaction.findMany({
      where: {
        userId: session.user.id,
        fiatCurrency: currencyType as CurrencyType,
        type: {
          in: [
            TransactionType.FIAT_DEPOSIT,
            TransactionType.FIAT_WITHDRAWAL,
            TransactionType.BUY_CRYPTO,
            TransactionType.SELL_CRYPTO,
          ],
        },
      },
      include: {
        fiatBalance: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("[TRANSACTIONS_BY_CURRENCY_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 