import { NextResponse } from "next/server"
import { auth } from "@/auth"
import db from "@/lib/db"
import { CryptoType } from "@prisma/client"

export async function GET(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const currency = searchParams.get("currency")

    if (currency) {
      const cryptoBalance = await db.cryptoBalance.findFirst({
        where: { userId: session.user.id, cryptoType: currency as CryptoType }
      })
      return NextResponse.json(cryptoBalance)
    }


    if (type === "crypto") {
      const cryptoBalances = await db.cryptoBalance.findMany({
        where: { userId: session.user.id }
      })
      return NextResponse.json(cryptoBalances)
    } else {
      const fiatBalances = await db.fiatBalance.findMany({
        where: { userId: session.user.id }
      })
      return NextResponse.json(fiatBalances)
    }
  } catch (error) {
    console.error("[BALANCES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}