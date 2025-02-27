import { NextResponse } from "next/server"
import { auth } from "@/auth"
import db from "@/lib/db"
import { newBankAccountSchema } from "@/lib/schemas/bank-account"
import { CurrencyType } from "@prisma/client"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const bankAccounts = await db.userBankAccount.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(bankAccounts)
  } catch (error) {
    console.error("[BANK_ACCOUNTS_GET]", error)
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
    const validationResult = newBankAccountSchema.safeParse(body)

    if (!validationResult.success) {
      return new NextResponse("Invalid input", { status: 400 })
    }

    const { 
      accountHolderName, 
      accountType, 
      bankAddress, 
      bankCountry, 
      proofDocumentUrl, 
      accountNumber, 
      iban 
    } = validationResult.data

    const bankAccount = await db.userBankAccount.create({
      data: {
        accountHolder: accountHolderName || "",
        bankAddress,
        bankCountry,
        proofDocumentUrl,
        accountNumber: accountNumber || "",
        iban: iban || "",
        userId: session.user.id,
        currency: bankCountry as CurrencyType,
        bankName: accountType as string,

      },
    })

    return NextResponse.json(bankAccount)
  } catch (error) {
    if (error instanceof Error) {
      console.error("[BANK_ACCOUNT_POST]", error.message)
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return new NextResponse("Bank account ID is required", { status: 400 })
    }

    // Verify ownership
    const existingAccount = await db.userBankAccount.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })


    if (!existingAccount) {
      return new NextResponse("Bank account not found", { status: 404 })
    }

    await db.userBankAccount.delete({
      where: { id }
    })


    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[BANK_ACCOUNT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 