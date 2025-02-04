import { NextResponse } from "next/server"
import { auth } from "@/auth"
import  db  from "@/lib/db"
import { z } from "zod"
import { newBankAccountSchema } from "@/lib/schemas/bank-account"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const bankAccounts = await db.bankAccount.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        transactions: {
          orderBy: {
            createdAt: "desc"
          },
          take: 5 // Get last 5 transactions
        }
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

    const { accountHolder, bankName, accountNumber, iban, currency, bankAddress, bankCountry } = validationResult.data

    // Check if IBAN already exists (if provided)
    if (iban) {
      const existingAccount = await db.bankAccount.findUnique({
        where: { iban },
      })

      if (existingAccount) {
        return new NextResponse("Bank account with this IBAN already exists", { status: 400 })
      }
    }

    const bankAccount = await db.bankAccount.create({
      data: {
        accountHolder,
        bankName,
        accountNumber,
        iban,
        currency,
        bankAddress,
        bankCountry,
        userId: session.user.id,
      },
    })

    return NextResponse.json(bankAccount)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    
    console.error("[BANK_ACCOUNT_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { id, ...updateData } = z.object({
      id: z.string(),
      accountHolder: z.string().optional(),
      bankName: z.string().optional(),
      accountNumber: z.string().optional(),
      iban: z.string().optional(),
      currency: z.string().optional(),
      bankAddress: z.string().optional(),
      bankCountry: z.string().optional(),
    }).parse(body)

    // Verify ownership
    const existingAccount = await db.bankAccount.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingAccount) {
      return new NextResponse("Bank account not found", { status: 404 })
    }

    // Check IBAN uniqueness if being updated
    if (updateData.iban && updateData.iban !== existingAccount.iban) {
      const ibanExists = await db.bankAccount.findUnique({
        where: { iban: updateData.iban }
      })

      if (ibanExists) {
        return new NextResponse("Bank account with this IBAN already exists", { status: 400 })
      }
    }

    const updatedAccount = await db.bankAccount.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedAccount)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }

    console.error("[BANK_ACCOUNT_PUT]", error)
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
    const existingAccount = await db.bankAccount.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingAccount) {
      return new NextResponse("Bank account not found", { status: 404 })
    }

    // Check if there are any pending transactions
    const pendingTransactions = await db.transaction.findFirst({
      where: {
        bankAccountId: id,
        status: "PENDING"
      }
    })

    if (pendingTransactions) {
      return new NextResponse(
        "Cannot delete bank account with pending transactions", 
        { status: 400 }
      )
    }

    await db.bankAccount.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[BANK_ACCOUNT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 