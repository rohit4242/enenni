import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { SumsubClient } from "@/lib/sumsub";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { applicantId } = body;

    if (!applicantId) {
      return NextResponse.json(
        { error: "Applicant ID is required" },
        { status: 400 }
      );
    }

    const sumsub = new SumsubClient();
    await sumsub.updateApplicantStatus(session.user.id, applicantId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[UPDATE_APPLICANT_STATUS]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 