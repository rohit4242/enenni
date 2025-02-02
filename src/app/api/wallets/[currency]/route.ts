import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { currency: string } }
) {
  try {
    // For now, return mock data
    const mockWallet = {
      id: "1",
      address: "0x1234...5678",
      type: "First party",
      status: "APPROVED",
      balance: params.currency === "USDT" ? "1000.50" :
               params.currency === "BTC" ? "0.05" :
               params.currency === "ETH" ? "2.75" : "500.00",
      currency: params.currency.toUpperCase(),
      userId: "1",
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json(mockWallet)
  } catch (error) {
    console.error('[WALLET_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 