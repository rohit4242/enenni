import { NextResponse } from "next/server"
import { auth } from "@/auth"
import db from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const cryptoWallets = await db.userCryptoWallet.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(cryptoWallets)
  } catch (error) {
    console.error("[CRYPTO_WALLETS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { walletAddress, cryptoType, nickname, type } = body

    const wallet = await db.userCryptoWallet.create({
      data: {
        walletAddress,
        cryptoType,
        nickname,
        type,
        userId: session.user.id,

      },
    })

    return NextResponse.json(wallet)
  } catch (error) {
    console.error("[CRYPTO_WALLET_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 