"use server";

import { auth } from "@/auth";
import { Quote } from "@/hooks/use-quote";
import db from "@/lib/db";
import { generateReferenceId } from "@/lib/utils";

export async function createOrder(quote: Quote) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const referenceId = generateReferenceId({ prefix: "ORD", length: 6 });

    const order = await db.order.create({
      data: {
        user: {
          connect: {
            id: session.user.id,
          },
        },
        type: quote.tradeType,
        asset: quote.crypto,
        quantity: quote.calculatedQuantity,
        pricePerToken: quote.quoteRate,
        status: "PENDING",
        totalAmount: quote.calculatedAmount,
        currency: quote.currency,
        referenceId,
      },
    });

    return {
      ...order,
      quantity: quote.calculatedQuantity,
      pricePerToken: quote.quoteRate,
      totalAmount: quote.calculatedAmount,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Failed to create order" };
  }
}
