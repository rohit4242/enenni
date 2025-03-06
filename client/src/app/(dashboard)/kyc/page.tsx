"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, useToast } from "@/hooks/use-toast";
import { BeatLoader } from "react-spinners";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

declare global {
  interface Window {
    snsWebSdk?: {
      init: (accessToken: string, tokenExpirationHandler: () => Promise<string>) => any;
    };
  }
}

export default function KYCPage() {
  const { user,isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const sdkRef = useRef<any>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(null);

  const getNewAccessToken = async (userId: string) => {
    try {
      const response = await fetch("/api/sumsub/access-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.token;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      throw error;
    }
  };

  useEffect(() => {
    async function checkVerification() {
      try {
        const response = await fetch(`/api/sumsub/check-verification?applicantId=679f8a35dc63600a2574e5f8`);
        const data = await response.json();
        setIsVerified(data.isVerified);
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    }


    checkVerification();
  }, [user?.id]);


  console.log("isVerified: ", isVerified)

  const handleStartKYC = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User session not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    if (!window.snsWebSdk) {
      toast({
        title: "Error",
        description: "SDK not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = await getNewAccessToken(user?.id || "");
      if (!accessToken) {
        throw new Error("Failed to get access token");
      }

      const snsWebSdkInstance = window.snsWebSdk
        .init(accessToken, () => getNewAccessToken(user?.id || ""))
        .withConf({
          lang: "en",
          theme: "light",
          email: user?.email || "",
          enableScrollIntoView: true,
        })
        .withOptions({
          addViewportTag: false,
          adaptIframeHeight: true
        })
        .on("idCheck.onStepCompleted", (payload: any) => {
          console.log("Step completed:", {
            stepId: payload.stepId,
            applicantId: payload.applicantId,
            step: payload.step
          });
        })
        .on("idCheck.onApplicantSubmitted", async (payload: any) => {
          console.log("Applicant submitted:", {
            applicantId: payload.applicantId,
            reviewStatus: payload.reviewStatus
          });

          try {
            // Update applicant status in database
            const response = await fetch("/api/sumsub/update-status", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                applicantId: payload.applicantId,
                userId: user?.id || ""
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to update applicant status");
            }

            toast({
              title: "Success",
              description: "KYC verification submitted successfully. Please wait for review.",
            });
          } catch (error) {
            console.error("Failed to update status:", error);
            toast({
              title: "Warning",
              description: "Verification submitted but status update failed",
              variant: "destructive",
            });
          }
        }).on("idCheck.onModuleResultPresented", (payload: any) => {
          console.log("Module result presented:", payload);
        })

        .on("idCheck.onError", (error: Error) => {
          console.error("SDK Error:", error);
          toast({
            title: "Error",
            description: "KYC verification failed. Please try again.",
            variant: "destructive",
          });
        })
        .build();

      // Launch the SDK
      snsWebSdkInstance.launch("#sumsub-websdk-container");
      sdkRef.current = snsWebSdkInstance;
    } catch (error: any) {
      console.error("KYC Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start KYC process",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (window.snsWebSdk) {
      setIsSDKLoaded(true);
      console.log("Sumsub SDK loaded successfully");
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user?.kycStatus === "APPROVED") {
      router.push("/dashboard");
      return;
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BeatLoader />
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://static.sumsub.com/idensic/static/sns-websdk-builder.js"
        strategy="afterInteractive"
        onLoad={() => setIsSDKLoaded(true)}
      />
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <h1 className="text-2xl font-bold">KYC Verification Required</h1>
          <p className="text-gray-600">
            Please complete the KYC verification process to continue using our services.
          </p>
          <div id="sumsub-websdk-container"></div>
          <Button
            onClick={handleStartKYC}
            className="w-full"
            disabled={!isSDKLoaded || isLoading}
          >
            {isLoading ? (
              <BeatLoader size={8} color="white" />
            ) : (
              "Start KYC Verification"
            )}
          </Button>
        </div>
      </div>
    </>
  );
} 