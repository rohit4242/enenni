import { NextResponse } from "next/server"

export async function GET() {
  try {

    const mockWallet = {

      id: "1",
      address: "0x1234...5678",
      type: "First party",
      status: "APPROVED",
      balance: "1000.50",
      currency: "USDT",
      userId: "1",
      createdAt: new Date(),
      updatedAt: new Date()

    }

    return NextResponse.json(mockWallet)
  } catch (error) {
    console.error('[WALLET_GET]', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 