import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock balances data
    const mockBalances = [
      {
        id: "1",
        currency: "AED",
        balance: "0.95",
      },
      {
        id: "2",
        currency: "USD",
        balance: "1000.50",
      },
      {
        id: "3",
        currency: "EUR",
        balance: "750.25",
      }
    ]

    return NextResponse.json(mockBalances)
  } catch (error) {
    console.error('[BALANCES_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 