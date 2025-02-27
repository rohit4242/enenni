import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const bankAccounts = await db.ennenniBankAccount.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(bankAccounts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bank accounts" },
      { status: 500 }
    );
  }
}