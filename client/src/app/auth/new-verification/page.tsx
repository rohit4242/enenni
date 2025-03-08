"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Mail } from "lucide-react";

export default function VerifyPromptPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Redirect to dashboard if already verified
  if (user?.emailVerified) {
    router.push("/dashboard");
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-6 p-6 bg-white shadow-lg rounded-lg text-center">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-blue-50 p-4">
          <Mail className="h-10 w-10 text-blue-500" />
        </div>
      </div>

      <h1 className="text-2xl font-bold">Verify Your Email</h1>
      
      <p className="text-gray-500">
        We&apos;ve sent a verification link to <span className="font-medium">{user?.email}</span>.
        Please check your inbox and click the link to verify your account.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Didn&apos;t receive an email?</p>
        <Button variant="outline" className="w-full">
          Resend Verification Email
        </Button>
      </div>
      
      <div className="text-sm">
        <Button variant="link" className="text-gray-500" onClick={() => router.push("/auth/login")}>
          Back to Login
        </Button>
      </div>
    </div>
  );
}
