import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const wallets = await prisma.wallet.findMany({
      where: {
        userId: "cm6o5oyzo0000ui48jucvqkky",
        status: "APPROVED"
      },
      include: {
        transactions: true
      }
    });

    return NextResponse.json(wallets);
  } catch (error) {
    console.error("[WALLETS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { address, type, currency } = body;

    if (!address || !type || !currency) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const wallet = await prisma.wallet.create({
      data: {
        address,
        type,
        currency,
        status: "PENDING",
        userId: session.user.id
      }
    });

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("[WALLETS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
