import { NextResponse } from "next/server";
import axios from "axios";
import { SumsubClient } from "@/lib/sumsub";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const applicantId = searchParams.get("applicantId");

    if (!applicantId) {
      return new NextResponse("Applicant ID is required", { status: 400 });
    }

    // Use the SumsubClient class to handle the API request
    const sumsub = new SumsubClient();
    
    // Get the required ID docs status for the applicant
    const response = await axios.get(
      `https://api.sumsub.com/resources/applicants/679f8a35dc63600a2574e5f8/basicInfo`,
      {
        headers: {
          "X-App-Token": process.env.SUMSUB_APP_TOKEN || sumsub['appToken'],
          "X-App-Access-Sig": sumsub['createSignature'](
            Math.floor(Date.now() / 1000),
            "GET",
            `/resources/applicants/679f8a35dc63600a2574e5f8/basicInfo`
          ),
          "X-App-Access-Ts": Math.floor(Date.now() / 1000).toString(),

        },
      }
    );

    // Check if the response indicates verification is complete
    const isVerified = response.data?.review?.reviewResult?.reviewAnswer === "GREEN";

    return NextResponse.json({ isVerified });
  } catch (error) {
    console.error("[SUMSUB_VERIFICATION_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
}
