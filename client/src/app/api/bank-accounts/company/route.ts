import  db  from "@/lib/db";
import { CurrencyType } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get("currency") as CurrencyType;

  if (!currency) {
    return new NextResponse("Currency is required", { status: 400 });
  }

  try {
    const bankAccount = await db.ennenniBankAccount.findFirst({
      where: {
        currency,
        isActive: true,
      },
    });

    return NextResponse.json(bankAccount);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
} 