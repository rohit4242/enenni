import { NextResponse } from "next/server";
import { SumsubClient } from "@/lib/sumsub";
import { auth } from "@/auth";

export async function POST() {
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

    } catch (error) {
      console.error("[SUMSUB_ACCESS_TOKEN] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create access token";
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("[SUMSUB_ACCESS_TOKEN] Unexpected Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 