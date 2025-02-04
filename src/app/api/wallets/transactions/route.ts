import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/db"
import { depositSchema, withdrawSchema } from "@/lib/schemas/transaction"
import { Decimal } from "@prisma/client/runtime/library"

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { type, ...data } = body

    // Validate based on transaction type
    const validationResult = type === "DEPOSIT" 
      ? depositSchema.safeParse(data)
      : withdrawSchema.safeParse(data)

    if (!validationResult.success) {
      return new NextResponse("Invalid input", { status: 400 })
    }

    // Start a transaction to ensure atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Find user's wallet
      const wallet = await tx.wallet.findFirst({
        where: {
          userId: session.user.id,
          currency: data.currency.toUpperCase(),
        },
      })

      if (!wallet) {
        throw new Error("Wallet not found")
      }

      const amount = new Decimal(data.amount)

      // For withdrawals, check if enough balance
      if (type === "WITHDRAWAL") {
        if (wallet.balance.lessThan(amount)) {
          throw new Error("Insufficient balance")
        }
      }

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          type,
          amount: amount.toString(),
          currency: data.currency.toUpperCase(),
          status: "PENDING",
          referenceId: `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          description: type === "DEPOSIT" 
            ? `Deposit from wallet ${data.fromWallet}`
            : `Withdrawal to wallet ${data.toWallet}`,
          walletId: wallet.id,
        },
      })

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: type === "DEPOSIT"
            ? wallet.balance.add(amount)
            : wallet.balance.sub(amount)
        },
      })

      return { transaction, wallet: updatedWallet }
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error("[TRANSACTIONS_POST]", error)
    
    if (error instanceof Error) {
      if (error.message === "Insufficient balance") {
        return new NextResponse("Insufficient balance", { status: 400 })
      }
      if (error.message === "Wallet not found") {
        return new NextResponse("Wallet not found", { status: 404 })
      }
    }
    
    return new NextResponse("Internal error", { status: 500 })
  }
}