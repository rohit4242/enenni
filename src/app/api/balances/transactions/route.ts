import { NextResponse } from "next/server"

export async function GET(
  req: Request,
) {
  try {
    const { searchParams } = new URL(req.url)
    const currency = searchParams.get('currency')?.toUpperCase()

    const mockTransactions = {
      AED: [
        {
          id: "1",
          type: "DEPOSIT",
          amount: "50,000.00",
          currency: "AED",
          status: "COMPLETED",
          reference: "2791737896016",
          date: "2024-01-26T16:53:00Z"
        },
        {
          id: "2",
          type: "WITHDRAWAL",
          amount: "25,000.00",
          currency: "AED",
          status: "PENDING",
          reference: "2791737896017",
          date: "2024-01-25T14:30:00Z"
        },
        {
            id: "2",
            type: "WITHDRAWAL",
            amount: "25,000.00",
            currency: "AED",
            status: "PENDING",
            reference: "2791737896017",
            date: "2024-01-25T14:30:00Z"
          }
      ],
      USD: [
        {
          id: "3",
          type: "DEPOSIT",
          amount: "10,000.00",
          currency: "USD",
          status: "COMPLETED",
          reference: "2791737896018",
          date: "2024-01-24T09:15:00Z"
        }
      ],
      EUR: [
        {
          id: "4",
          type: "WITHDRAWAL",
          amount: "5,000.00",
          currency: "EUR",
          status: "COMPLETED",
          reference: "2791737896019",
          date: "2024-01-23T11:20:00Z"
        }
      ]
    }

    if (!currency) {
      return NextResponse.json([])
    }

    return NextResponse.json(mockTransactions[currency as keyof typeof mockTransactions] || [])
  } catch (error) {
    console.error('[BALANCES_TRANSACTIONS_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 