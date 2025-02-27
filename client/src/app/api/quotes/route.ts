import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";
import { CryptoType, CurrencyType } from "@prisma/client";

// Validation schema for quote creation
const createQuoteSchema = z.object({
  currency: z.string().min(1),
  crypto: z.string().min(1),
  tradeType: z.enum(["BUY", "SELL"]),
  currentPrice: z.number().positive(),
  calculatedAmount: z.number().positive(),
  calculatedQuantity: z.number().positive(),
  tradeFee: z.number().nonnegative(),
  netAmount: z.number().positive(),
  quantity: z.string().optional(),
  amount: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();
    
    // Validate request body
    const validationResult = createQuoteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const {
      currency,
      crypto,
      tradeType,
      currentPrice,
      calculatedAmount,
      calculatedQuantity,
      tradeFee,
      netAmount,
    } = validationResult.data;

    // Validate currency and crypto types
    if (!currency || !Object.values(CurrencyType).includes(currency as CurrencyType)) {
      return NextResponse.json(
        { error: "Invalid currency type" },
        { status: 400 }
      );
    }

    if (!crypto || !Object.values(CryptoType).includes(crypto as CryptoType)) {
      return NextResponse.json(
        { error: "Invalid crypto type" },
        { status: 400 }
      );
    }

    // Check user balances
    const userBalances = await Promise.all([
      db.fiatBalance.findUnique({
        where: {
          userId_currency: {
            userId: userId,
            currency: currency as CurrencyType,
          },
        },
      }),
      db.cryptoBalance.findUnique({
        where: {
          userId_cryptoType: {
            userId: userId,
            cryptoType: crypto as CryptoType,
          },
        },
      }),
    ]);

    const [fiatBalance, cryptoBalance] = userBalances;

    // Validate balances based on trade type
    if (tradeType === "BUY" && (!fiatBalance || fiatBalance.balance < netAmount)) {
      return NextResponse.json(
        { error: "Insufficient fiat balance" },
        { status: 400 }
      );
    }

    if (tradeType === "SELL" && (!cryptoBalance || cryptoBalance.balance < calculatedQuantity)) {
      return NextResponse.json(
        { error: "Insufficient crypto balance" },
        { status: 400 }
      );
    }

    // Create quote with all calculation details
    const quote = await db.quote.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        amount: calculatedAmount,
        currency,
        quoteRate: currentPrice,
        crypto,
        type: tradeType,
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 15000),
        calculatedAmount,
        calculatedQuantity,
        tradeFee,
        netAmount,
        currentPrice,
        tradeType,
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

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quotes = await db.quote.findMany({
      where: {
        userId: session.user.id,
        OR: [
          {
            AND: [{ status: "ACTIVE" }, { expiresAt: { gt: new Date() } }],
          },
          {
            OR: [
              { status: "EXPIRED" },
              {
                AND: [{ status: "ACTIVE" }, { expiresAt: { lte: new Date() } }],
              },
            ],
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
          {
            status: "ACCEPTED",
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Update expired quotes
    const now = new Date();
    const expiredActiveQuotes = quotes.filter(
      q => q.status === "ACTIVE" && new Date(q.expiresAt) <= now
    );
    
    if (expiredActiveQuotes.length > 0) {
      await db.quote.updateMany({
        where: {
          id: { in: expiredActiveQuotes.map(q => q.id) },
          status: "ACTIVE",
          expiresAt: { lte: now }
        },
        data: {
          status: "EXPIRED"
        }
      });
    }

    return NextResponse.json(quotes);
  } catch (error) {
    console.error("[QUOTES_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.quote.deleteMany({
      where: {
        userId: session.user.id,
        status: { in: ["ACTIVE", "ACCEPTED"] },
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
