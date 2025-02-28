import { NextResponse } from "next/server";
import db from "@/lib/db";
import { generateReferenceId } from "@/lib/utils";
import { currentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const quoteId = (await params).quoteId;

  console.log("quoteId: ", quoteId);

  try {
    const user = await currentUser();
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!quoteId) {
      return new NextResponse("Quote ID is required", { status: 400 });
    }

    const quote = await db.quote.findUnique({
      where: { id: quoteId },
    });

    console.log("quote", quote);

    if (!quote) {
      return new NextResponse("Quote not found", { status: 404 });
    }

    if (quote.status !== "ACTIVE" || new Date(quote.expiresAt) < new Date()) {
      return new NextResponse("Quote has expired", { status: 400 });
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
        return new NextResponse("Insufficient fiat balance", { status: 400 });
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

      if (
        !cryptoBalance ||
        cryptoBalance.balance < Number(quote.calculatedQuantity)
      ) {
        return new NextResponse("Insufficient crypto balance", { status: 400 });
      }
    }

    const referenceId = generateReferenceId({ prefix: "ORD", length: 6 });

    // Create order first
    const order = await db.order.create({
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
    });

    // Then update quote with the order's id
    await db.quote.update({
      where: { id: quoteId },
      data: {
        status: "ACCEPTED",
        orderId: order.id, // Use the order's id instead of referenceId
      },
    });

    return new NextResponse(JSON.stringify(order));
  } catch (error) {
    console.error(
      "[QUOTE_ACCEPT]",
      error instanceof Error ? error.message : "Unknown error"
    );
    return new NextResponse(
      JSON.stringify({ error: "Failed to accept quote" }),
      { status: 500 }
    );
  }
}
