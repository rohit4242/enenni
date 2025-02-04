import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { transactionSchema } from "@/lib/types/bank-account";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!accountId) {
      return new NextResponse("Account ID is required", { status: 400 });
    }

    const transactions = await db.transaction.findMany({
      where: {
        id: session.user.id,
        bankAccountId: accountId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const validatedTransactions = transactions.map((transaction) =>
      transactionSchema.parse(transaction)
    );

    return NextResponse.json(validatedTransactions);
  } catch (error) {
    console.error("[BANK_TRANSACTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
