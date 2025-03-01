import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/auth";

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
    const session = await auth()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

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
      where: {
        userId: session.user.id,
        ...where,
      },
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
