import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

// Verify Sumsub webhook signature
function verifySignature(req: Request, body: string) {
  const digest = req.headers.get('x-payload-digest');
  const algorithm = req.headers.get('x-payload-digest-alg');
  
  if (!digest || !algorithm) {
    console.error("Missing digest or algorithm headers");
    return false;
  }

  const secret = process.env.SUMSUB_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("SUMSUB_WEBHOOK_SECRET is not set");
  }

  // Map Sumsub's algorithm names to crypto module names
  const algorithmMap: Record<string, string> = {
    'HMAC_SHA1_HEX': 'sha1',
    'HMAC_SHA256_HEX': 'sha256',
    'HMAC_SHA512_HEX': 'sha512'
  };

  const cryptoAlgorithm = algorithmMap[algorithm];
  if (!cryptoAlgorithm) {
    console.error(`Unsupported algorithm: ${algorithm}`);
    return false;
  }

  try {
    const hmac = crypto.createHmac(cryptoAlgorithm, secret);
    const calculatedDigest = hmac.update(body).digest('hex');
    
    // Log for debugging
    console.log('Received digest:', digest);
    console.log('Calculated digest:', calculatedDigest);
    
    return calculatedDigest === digest;
  } catch (error) {
    console.error("[SIGNATURE_VERIFICATION_ERROR]", error);
    return false;
  }
}

// Process the webhook event asynchronously
async function processWebhookEvent(body: any) {
  try {
    const { applicantId, reviewStatus, type, reviewResult } = body;

    console.log("Processing webhook event:", body);

    console.log("Applicant ID:", applicantId);
    console.log("Review Status:", reviewStatus);
    console.log("Type:", type);
    console.log("Review Result:", reviewResult);

    // Find user by applicantId
    const user = await db.user.findUnique({
      where: { sumsubApplicantId: applicantId },
    });

    if (!user) {
      console.error(`User not found for applicantId: ${applicantId}`);
      return;
    }
    console.log("User found:", type);

    // Update user KYC status based on webhook type
    switch (type) {
      case "applicantReviewed":
        await db.user.update({
          where: { id: user.id },
          data: {
            kycStatus: reviewResult?.reviewAnswer === "GREEN" ? "APPROVED" : "REJECTED",
            kycApprovedAt: reviewResult?.reviewAnswer === "GREEN" ? new Date() : null,
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

      case "applicantCreated":
        await db.user.update({
          where: { id: user.id },
          data: {
            kycStatus: "PENDING",
            kycSubmittedAt: new Date(),
          },
        });
        break;

      case "applicantPrechecked":
        if (reviewStatus?.reviewAnswer === "RED") {
          await db.user.update({
            where: { id: user.id },
            data: {
              kycStatus: "REJECTED",
            },
          });
        }
        break;

      case "applicantReset":
        await db.user.update({
          where: { id: user.id },
          data: {
            kycStatus: "PENDING",
            kycApprovedAt: null,
          },
        });
        break;

      case "videoIdentStatusChanged":
        // Handle video identification status changes if needed
        console.log("Video identification status changed:", body.videoIdentStatus);
        break;

      default:
        console.log(`Unhandled webhook type: ${type}`);
    }
  } catch (error) {
    console.error("[PROCESS_WEBHOOK_EVENT]", error);
  }
}

export async function POST(req: Request) {
  try {
    // Get raw body for signature verification
    const rawBody = await req.text();
    
    // Log headers and body for debugging
    console.log("Headers:", Object.fromEntries(req.headers.entries()));
    console.log("Raw Body:", rawBody);
    
    // Verify signature before processing
    if (!verifySignature(req, rawBody)) {
      console.error("[SUMSUB_WEBHOOK] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // Validate required fields
    if (!body.applicantId || !body.type) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Process the webhook event asynchronously
    processWebhookEvent(body).catch(error => {
      console.error("[ASYNC_WEBHOOK_PROCESSING]", error);
    });

    // Respond immediately to prevent timeout
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SUMSUB_WEBHOOK]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 