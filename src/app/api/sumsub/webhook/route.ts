import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

// Verify Sumsub webhook signature
function verifySignature(req: Request, body: string) {
  const signature = req.headers.get('x-payload-signature');
  if (!signature) return false;

  const secret = process.env.SUMSUB_WEBHOOK_SECRET || "";
  const hmac = crypto.createHmac('sha1', secret);
  const digest = hmac.update(body).digest('hex');
  
  return signature === digest;
}

export async function POST(req: Request) {
  try {
    // Get raw body for signature verification
    const rawBody = await req.text();
    if (!verifySignature(req, rawBody)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log(rawBody);

    const body = JSON.parse(rawBody);
    const { applicantId, reviewStatus, type } = body;

    console.log(body);

    if (!applicantId || !reviewStatus || !type) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Find user by applicantId
    const user = await db.user.findUnique({
      where: { sumsubApplicantId: applicantId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user KYC status based on webhook type
    switch (type) {
      case "applicantReviewed":
        await db.user.update({
          where: { id: user.id },
          data: {
            kycStatus: reviewStatus.reviewAnswer === "GREEN" ? "APPROVED" : "REJECTED",
            kycApprovedAt: reviewStatus.reviewAnswer === "GREEN" ? new Date() : null,
          },
        });
        break;

      case "applicantPending":
        await db.user.update({
          where: { id: user.id },
          data: {
            kycStatus: "PENDING",
          },
        });
        break;

      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SUMSUB_WEBHOOK]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 