import { NextRequest } from "next/server";
import db from "@/lib/db";
import { generateReferenceId } from "@/lib/utils";
import { currentUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ quoteId: string }> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const { quoteId } = await context.params;

    const quote = await db.quote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      return new Response(JSON.stringify({ error: "Quote not found" }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (quote.status !== "ACTIVE" || new Date(quote.expiresAt) < new Date()) {
      return new Response(JSON.stringify({ error: "Quote has expired" }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const referenceId = generateReferenceId({ prefix: "ORD", length: 6 });

    // Create order and update quote in a transaction
    const [order] = await db.$transaction([
      db.order.create({
        data: {
          userId: user.id as string,
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

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("[QUOTE_ACCEPT]", error);
    return new Response(JSON.stringify({ 
      error: "Failed to accept quote" 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
