import { NextResponse } from "next/server";
import { SumsubClient } from "@/lib/sumsub";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sumsub = new SumsubClient();
    try {
      const result = await sumsub.createAccessToken(session.user.id);
      
      return NextResponse.json(
        { token: result.token },
        { status: 200 }
      );

    } catch (error: any) {
      console.error("[SUMSUB_ACCESS_TOKEN] Error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create access token" },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("[SUMSUB_ACCESS_TOKEN] Unexpected Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 