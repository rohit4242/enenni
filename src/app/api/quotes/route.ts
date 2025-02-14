import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await req.json();
    const {
      currency,
      quantity,
      amount,
      tradeType,
      crypto,
      currentPrice,
      calculatedAmount,
      calculatedQuantity,
    } = body;

    // Validate required fields
    if (!currency || !tradeType || !crypto || !currentPrice?.price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create quote with proper data
    const quote = await db.quote.create({
      data: {
        amount: calculatedAmount || amount,
        quoteRate: calculatedQuantity || quantity,
        currency,
        crypto,
        type: tradeType,
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 7000), // 7 seconds
        createdAt: new Date(),
      },
    });

    return NextResponse.json(quote);
  } catch (error) {
    console.error("[QUOTES_POST]", error);
    return NextResponse.json(
      { error: "Failed to create quote" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const quotes = await db.quote.findMany({
      where: {
        OR: [
          // Active quotes
          { 
            AND: [
              { status: "ACTIVE" }, 
              { expiresAt: { gt: new Date() } }
            ] 
          },
          // Expired or used quotes (last 24 hours)
          {
            OR: [
              { status: "EXPIRED" },
              { 
                AND: [
                  { status: "ACTIVE" },
                  { expiresAt: { lte: new Date() } }
                ]
              }
            ],
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        ]
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error("[QUOTES_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await db.quote.deleteMany({
      where: {
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ message: "All quotes cleared successfully" });
  } catch (error) {
    console.error("[QUOTES_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to clear quotes" },
      { status: 500 }
    );
  }
}
