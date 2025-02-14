import { NextResponse } from "next/server"
import { auth } from "@/auth"
import db from "@/lib/db"
import { TransactionType, TransactionStatus, CryptoType, CurrencyType } from "@prisma/client"
import { generateReferenceId } from "@/lib/utils"

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { type, amount, cryptoType, fiatCurrency } = body

    // Start transaction
    const transaction = await db.$transaction(async (tx) => {
      // Create transaction record
      const newTransaction = await tx.transaction.create({
        data: {
          userId: session.user.id as string,
          type: type as TransactionType,
          status: TransactionStatus.PENDING,
          
          cryptoAmount: type.includes('CRYPTO') ? Number(amount) : null,
          cryptoType: type.includes('CRYPTO') ? (cryptoType as CryptoType) : null,
          fiatAmount: type.includes('FIAT') ? Number(amount) : null,
          fiatCurrency: type.includes('FIAT') ? (fiatCurrency as CurrencyType) : null,
          transactionHash: type.includes('CRYPTO') ? cryptoType : type.includes('FIAT') ? fiatCurrency : null,
          referenceId: generateReferenceId({ prefix: type.includes('CRYPTO') ? 'CRY' : 'FIAT', length: 8 }),
          description: `${type} transaction for ${type.includes('CRYPTO') ? cryptoType : fiatCurrency}`,
        },
      })


      // Update relevant balance
      if (type.includes('CRYPTO') && cryptoType && session.user?.id) {
        await tx.cryptoBalance.upsert({
          where: {
            userId_cryptoType: {
              userId: session.user.id,
              cryptoType: cryptoType as CryptoType,
            },
          },
          create: {
            userId: session.user.id,
            cryptoType: cryptoType as CryptoType,
            balance: 0,
            walletAddress: cryptoType === "BTC" ? "bc1q..." : cryptoType === "ETH" ? "0x..." : cryptoType === "USDC" ? "0x..." : cryptoType === "USDT" ? "0x..." : "",
          },

          update: {},
        })
      } else if (type.includes('FIAT') && fiatCurrency && session.user?.id) {
        await tx.fiatBalance.upsert({
          where: {
            userId_currency: {
              userId: session.user.id,
              currency: fiatCurrency as CurrencyType,
            },
          },
          create: {
            userId: session.user.id,
            currency: fiatCurrency as CurrencyType,
            balance: 0,
          },
          update: {},
        })
      }

      return newTransaction
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("[TRANSACTION_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const currency = searchParams.get("currency") as CurrencyType;

    if (!currency) {
      return new NextResponse("Currency is required", { status: 400 });
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: session.user.id,
        fiatCurrency: currency,
      },
      orderBy: {
        createdAt: "desc",
      },
    });


    return NextResponse.json(transactions);
  } catch (error) {
    console.error("[TRANSACTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 

