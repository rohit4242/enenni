// lib/sumsub.ts
import crypto from "crypto";

interface SumsubWebhookEvent {
  applicantId: string;
  reviewResult: {
    reviewAnswer: "GREEN" | "RED";
  };
}

export class SumsubClient {
  private baseUrl = "https://api.sumsub.com";
  private appToken: string;
  private secretKey: string;

  constructor() {
    this.appToken =
      process.env.SUMSUB_APP_TOKEN ||
      "sbx:TiHbApn3e2JDxVWgzfQhZgw6.sD1Wcl7C0MQbbIQRV62PwcZnmvxCHzay";
    this.secretKey =
      process.env.SUMSUB_SECRET_KEY || "4R55De84jD6mvi6HcVv5g3rq7v7x3MXg";
  }

  private createSignature(
    ts: number,
    method: string,
    path: string,
    body: string = ""
  ) {
    const data = ts + method + path + body;
    return crypto
      .createHmac("sha256", this.secretKey)
      .update(data)
      .digest("hex");
  }

  async createAccessToken(
    externalUserId: string,
    levelName: string = "basic-kyc"
  ) {
    const ts = Math.floor(Date.now() / 1000);
    const path = "/resources/accessTokens/sdk/";
    const body = JSON.stringify({
      userId: externalUserId,
      levelName,
      ttlInSecs: 3600,
    });

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-App-Token": this.appToken,
          "X-App-Access-Ts": ts.toString(),
          "X-App-Access-Sig": this.createSignature(ts, "POST", path, body),
        },
        body,
      });

      const responseText = await response.text();
      console.log("Sumsub Raw Response:", responseText);

      const data = JSON.parse(responseText);

      if (!response.ok) {
        throw new Error(data.description || "Failed to create access token");
      }

      return {
        token: data.token,
        userId: externalUserId,
      };
    } catch (error) {
      console.error("Sumsub API Error:", error);
      throw error;
    }
  }

  async handleWebhookEvent(event: SumsubWebhookEvent) {
    const { applicantId, reviewResult } = event;

  }

  async updateApplicantStatus(userId: string, applicantId: string) {
    try {

    } catch (error) {
      console.error("Failed to update applicant status:", error);
      throw error;
    }
  }
}
