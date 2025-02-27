"use server";

import prisma from "@/lib/db";

// Check MFA status
export async function checkMfaStatus(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  return {
    isEnabled: user.mfaEnabled,
    isSetup: !!user.mfaSecret,
    secret: user.mfaSecret,
    qrCode: user.mfaQrCode,
  };
}

// Setup MFA
export async function setupMFA(userId: string, email: string) {
  try {
    const response = await fetch(
      `http://localhost:3001/api/mfa/setup?name=${encodeURIComponent(userId)}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to setup MFA: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.secret || !data.qrCodeUrl) {
      throw new Error("Invalid MFA setup data received");
    }

    await prisma.user.update({
      where: { id: userId, email: email },
      data: {
        mfaSecret: data.secret.base32,
        mfaQrCode: data.qrCodeUrl,
      },
    });

    return data;
  } catch (error) {
    console.error("MFA setup error:", error);
    throw new Error("Failed to setup MFA");
  }
}

// Verify MFA
export async function verifyMFA(userId: string, code: string, secret: string) {
  try {
    const response = await fetch("http://localhost:3001/api/mfa/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, secret }),
    });

    if (!response.ok) {
      throw new Error("Failed to verify MFA code");
    }

    const data = await response.json();

    if (data.verified) {
      await prisma.user.update({
        where: { id: userId },
        data: { mfaEnabled: true },
      });
      return { verified: true };
    }
    
    return { verified: false };
  } catch (error) {
    console.error("MFA verification error:", error);
    throw new Error("Failed to verify MFA code");
  }
}

// Disable MFA
export async function disableMFA(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: false,
      mfaSecret: null,
      mfaQrCode: null,
    },
  });

  return { disabled: true };
} 