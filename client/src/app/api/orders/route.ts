import { NextResponse } from "next/server";
import db from "@/lib/db";
import { generateReferenceId } from "@/lib/utils";
import { currentUser } from "@/lib/auth";
import { z } from "zod";

const createOrderSchema = z.object({
  quoteId: z.string().min(1),
});

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
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = createOrderSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { quoteId } = validationResult.data;

    const quote = await db.quote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.status !== "ACTIVE" || new Date(quote.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Quote has expired" }, { status: 400 });
    }

    // Check balances before creating order
    if (quote.tradeType === "BUY") {
      const fiatBalance = await db.fiatBalance.findUnique({
        where: {
          userId_currency: {
            userId: user.id,
            currency: quote.currency as any,
          },
        },
      });

      if (!fiatBalance || fiatBalance.balance < Number(quote.netAmount)) {
        return NextResponse.json(
          { error: "Insufficient fiat balance" },
          { status: 400 }
        );
      }
    } else {
      const cryptoBalance = await db.cryptoBalance.findUnique({
        where: {
          userId_cryptoType: {
            userId: user.id,
            cryptoType: quote.crypto as any,
          },
        },
      });

      if (!cryptoBalance || cryptoBalance.balance < Number(quote.calculatedQuantity)) {
        return NextResponse.json(
          { error: "Insufficient crypto balance" },
          { status: 400 }
        );
      }
    }

    const referenceId = generateReferenceId({ prefix: "ORD", length: 6 });

    const [order] = await db.$transaction([
      db.order.create({
        data: {
          userId: user.id,
          referenceId,
          type: quote.tradeType,
          status: "PENDING",
          quantity: Number(quote.calculatedQuantity),
          asset: quote.crypto,
          currency: quote.currency,
          pricePerToken: Number(quote.currentPrice),
          totalAmount: Number(quote.netAmount),
        },
      }),
      db.quote.update({
        where: { id: quoteId },
        data: { 
          status: "ACCEPTED",
          orderId: referenceId,
        },
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
