import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const walletIdSchema = z.string().min(1, "Wallet ID is required").toUpperCase();

export async function GET(
  req: Request,
  { params }: { params: { walletId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate walletId using zod
    const validationResult = walletIdSchema.safeParse(params.walletId);
    if (!validationResult.success) {
      return new NextResponse("Invalid wallet ID", { status: 400 });
    }

    const walletId = validationResult.data;

    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: 'cm6o5oyzo0000ui48jucvqkky',
        currency: walletId.toUpperCase(),
      },
      include: {
        transactions: true
      }
    });

    if (!wallet) {
      return new NextResponse("Wallet not found", { status: 404 });
    }

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("[WALLET_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
