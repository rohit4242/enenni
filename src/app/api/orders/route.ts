import { NextResponse } from "next/server";
import db from "@/lib/db";
import { generateReferenceId } from "@/lib/utils";
import { currentUser } from "@/lib/auth";

interface WhereClause {
  referenceId?: {
    contains: string;
    mode: "insensitive";
  };
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const where: WhereClause = {};

    if (search) {
      where.referenceId = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const orders = await db.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quoteId } = body;

    const user = await currentUser();

    
    if (!user) {
      return NextResponse.json({ error: "Not Authentication" }, { status: 404 });
    }
    if (!quoteId) {
      return NextResponse.json(
        { error: "Quote ID is required" },
        { status: 400 }
      );
    }

    const quote = await db.quote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.status !== "ACTIVE" || new Date(quote.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Quote has expired" }, { status: 400 });
    }

    console.log("quote: ++++===: ", quote)

    const referenceId = generateReferenceId({ prefix: "ORD", length: 6 });

    // Create order and update quote in a transaction
    const [order] = await db.$transaction([
      db.order.create({
        data: {
          userId: user?.id as string,
          referenceId,
          type: quote.type,
          status: "PENDING",
          quantity: Number(quote.quoteRate),
          asset: quote.crypto,
          currency: quote.currency,
          pricePerToken: Number(quote.quoteRate),
          totalAmount: Number(quote.amount),

        },
      }),

      db.quote.update({
        where: { id: quoteId },
        data: { status: "USED" },
      }),
    ]);

    return NextResponse.json(order);
  } catch (error) {
    console.error(
      "[ORDERS_POST]",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
