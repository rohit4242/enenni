import { NextRequest, NextResponse } from "next/server"

export async function POST(
  req: NextRequest,
) {
 
  const body = await req.json()
  if (!body.currencyID) {

    return new NextResponse("Currency ID is required", { status: 400 })
  }
  try {
    // Mock transactions data for each currency
    const mockTransactions = {

      usdt: [
        {
          id: "1",
          type: "DEPOSIT",
          amount: "1000.00",
          currency: "USDT",
          status: "COMPLETED",
          referenceId: "TX123456",
          transactionHash: "0x1234...5678",
          destination: "0xabcd...efgh",
          createdAt: new Date("2024-03-15T10:00:00Z")
        },
        {
          id: "2",
          type: "WITHDRAWAL",
          amount: "500.00",
          currency: "USDT",
          status: "PENDING",
          referenceId: "TX123457",
          transactionHash: "0x5678...1234",
          destination: "0xijkl...mnop",
          createdAt: new Date("2024-03-14T15:30:00Z")
        }
      ],
      btc: [
        {
          id: "3",
          type: "DEPOSIT",
          amount: "0.05",
          currency: "BTC",
          status: "COMPLETED",
          referenceId: "TX123458",
          transactionHash: "0x9012...3456",
          destination: "0xqrst...uvwx",
          createdAt: new Date("2024-03-13T09:15:00Z")
        }
      ],
      eth: [
        {
          id: "4",
          type: "WITHDRAWAL",
          amount: "2.5",
          currency: "ETH",
          status: "COMPLETED",
          referenceId: "TX123459",
          transactionHash: "0x3456...7890",
          destination: "0xyzab...cdef",
          createdAt: new Date("2024-03-12T14:45:00Z")
        }
      ],
      usdc: [
        {
          id: "5",
          type: "DEPOSIT",
          amount: "750.00",
          currency: "USDC",
          status: "COMPLETED",
          referenceId: "TX123460",
          transactionHash: "0xmnop...qrst",
          destination: "0xuvwx...yzab",
          createdAt: new Date("2024-03-11T11:20:00Z")
        }
      ]
    }

    const currency = body.currencyID.toLowerCase() as 'usdt' | 'btc' | 'eth' | 'usdc'
    return NextResponse.json(mockTransactions[currency] || [])


  } catch (error) {
    console.error('[WALLET_TRANSACTIONS_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 