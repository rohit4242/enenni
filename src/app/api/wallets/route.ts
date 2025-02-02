import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET() {
  try {
    // Mock data instead of database query
    const dummyWallets = [
      {
        id: "1",
        address: "0x1234...5678",
        type: "First party",
        status: "APPROVED",
        balance: "1000.50",
        currency: "USDT",
        userId: "1",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "2",
        address: "0x8765...4321",
        type: "First party",
        status: "APPROVED",
        balance: "0.05",
        currency: "BTC",
        userId: "1",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "3",
        address: "0x9876...1234",
        type: "First party",
        status: "APPROVED",
        balance: "2.75",
        currency: "ETH",
        userId: "1",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "4",
        address: "0x4567...8901",
        type: "First party",
        status: "APPROVED",
        balance: "500.00",
        currency: "USDC",
        userId: "1",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    return NextResponse.json(dummyWallets)
  } catch (error) {
    console.error('[WALLETS_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 