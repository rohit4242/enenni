import { NextResponse } from "next/server"
import { auth } from "@/auth"
import db from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Use hardcoded user ID for testing
    const bankAccount = await db.bankAccount.findFirst({
      where: {
        userId: session.user.id,
        currency: params.accountId.toUpperCase()
      },
      include: {
        transactions: {
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    })

    if (!bankAccount) {
      return new NextResponse("Bank account not found", { status: 404 })
    }


    return NextResponse.json(bankAccount)
  } catch (error) {
    console.error("[BANK_ACCOUNT_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }

}
