"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import EnableMfa from "./_components/enable-mfa";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { checkMfaStatus } from "@/lib/actions/mfa";
import { Skeleton } from "@/components/ui/skeleton";

export default function SecurityPage() {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: mfaStatus, isPending } = useQuery({
    queryKey: ["mfa-status", session?.user?.id],
    queryFn: () => (session?.user?.id ? checkMfaStatus(session.user.id) : null),
    enabled: !!session?.user?.id,
  });

  if (!isMounted) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-4 w-24 inline-block" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Multi-Factor Authentication</h3>
        <span className="text-sm text-muted-foreground">
          Add an extra layer of security to your account
          {isPending ? (
            <Skeleton className="h-4 w-24 inline-block ml-2" />
          ) : mfaStatus?.isEnabled ? (
            <span className="text-green-600 ml-2">(Enabled)</span>
          ) : (
            <span className="text-yellow-600 ml-2">(Not Enabled)</span>
          )}
        </span>
      </div>
      <Separator />
      <EnableMfa />
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2">About 2FA Security</h4>
        <span className="text-sm text-muted-foreground">
          Two-factor authentication adds an additional layer of security to your
          account by requiring more than just a password to sign in. With 2FA
          enabled, you&apos;ll need to provide a code from your authenticator app
          whenever you sign in to your account.
        </span>
      </div>
    </div>
  );
}