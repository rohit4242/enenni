"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { checkMfaStatus, setupMFA, verifyMFA, disableMFA } from "@/lib/actions/mfa";
import Image from "next/image";

export default function EnableMfa() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userCode, setUserCode] = useState("");
  const { toast } = useToast();

  // Query for MFA status
  const { data: mfaStatus, isPending: statusLoading } = useQuery({
    queryKey: ["mfa-status", session?.user?.id],
    queryFn: () => (session?.user?.id ? checkMfaStatus(session.user.id) : null),
    enabled: !!session?.user?.id,
  });

  // Setup MFA mutation
  const { mutate: setupMutation, isPending: setupLoading } = useMutation({
    mutationFn: () => {
      if (!session?.user?.id || !session?.user?.email) {
        throw new Error("User not authenticated");
      }
      return setupMFA(session.user.id, session.user.email);
    },
    onSuccess: (data) => {
      if (data.message === "MFA already enabled") {
        toast({
          title: "Info",
          description: "MFA is already enabled for your account",
        });
        setIsOpen(false);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["mfa-status"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to setup MFA",
      });
    },
  });

  // Verify MFA mutation
  const { mutate: verifyMutation, isPending: verifyLoading } = useMutation({
    mutationFn: (code: string) => {
      if (!session?.user?.id || !mfaStatus?.secret) {
        throw new Error("Missing required data");
      }
      return verifyMFA(session.user.id, code, mfaStatus.secret);
    },
    onSuccess: (data) => {
      if (data.verified) {
        toast({
          title: "Success",
          description: "MFA enabled successfully",
        });
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: ["mfa-status"] });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid verification code",
        });
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to verify code",
      });
    },
  });

  // Disable MFA mutation
  const { mutate: disableMutation, isPending: disableLoading } = useMutation({
    mutationFn: () => {
      if (!session?.user?.id) throw new Error("User not authenticated");
      return disableMFA(session.user.id);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "MFA disabled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["mfa-status"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to disable MFA",
      });
    },
  });

  const onCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const onVerify = () => {
    if (!userCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter the verification code",
      });
      return;
    }
    verifyMutation(userCode);
  };

  return (
    <div className="flex gap-2">
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open) {
            setupMutation();
          }
        }}
      >
        <DialogTrigger asChild>
          <Button disabled={statusLoading || mfaStatus?.isEnabled}>
            {statusLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : mfaStatus?.isEnabled ? (
              "MFA Enabled"
            ) : (
              "Enable MFA"
            )}
          </Button>
        </DialogTrigger>
      
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setup Multi-Factor Authentication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {mfaStatus?.qrCode ? (
              <div className="flex justify-center">
                <Image
                  src={mfaStatus.qrCode}
                  alt="QR Code"
                  className="w-64 h-64"
                  width={100}
                  height={100}
                />
              </div>
            ) : (
              <p className="text-center">Loading QR Code...</p>
            )}
            {mfaStatus?.secret && (
              <div>
                <h3 className="font-semibold">Secret Key</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Input value={mfaStatus.secret} readOnly className="w-full" />
                  <Button
                    onClick={() => onCopy(mfaStatus.secret || "")}
                    variant="outline"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Scan the QR code with your authenticator app (e.g., Google
              Authenticator, Authy) or enter the secret key manually.
            </p>
            <div className="mt-4">
              <h3 className="font-semibold">Enter Verification Code</h3>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full"
                />
                <Button
                  onClick={onVerify}
                  variant="outline"
                  disabled={verifyLoading}
                >
                  {verifyLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {mfaStatus?.isEnabled && (
        <Button
          variant="destructive"
          onClick={() => disableMutation()}
          disabled={disableLoading}
        >
          {disableLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Disable MFA"
          )}
        </Button>
      )}
    </div>
  );
}
