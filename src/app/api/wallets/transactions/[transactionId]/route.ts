import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { TransactionStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: { transactionId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    // Validate status
    if (!Object.values(TransactionStatus).includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    // Get transaction and verify ownership
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: params.transactionId
      },
      include: {
        wallet: true
      }
    });

    if (!transaction || transaction.wallet?.userId !== session.user.id) {
      return new NextResponse("Transaction not found", { status: 404 });
    }

    // Update transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: {
        id: params.transactionId
      },
      data: {
        status,
        ...(status === TransactionStatus.COMPLETED && {
          transactionHash: `0x${Date.now().toString(16)}`
        })
      }
    });

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error("[TRANSACTION_STATUS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}