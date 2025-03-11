"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { ClientOnly } from "@/components/ClientOnly";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// The inner component that will be wrapped with ClientOnly
function ProtectedRouteContent({ children }: ProtectedRouteProps) {
  const { user, isLoading, isFetching, error, refetch } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-12 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// The exported component that uses ClientOnly
export function ProtectedRoute(props: ProtectedRouteProps) {
  return (
    <ClientOnly fallback={
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-12 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ProtectedRouteContent {...props} />
    </ClientOnly>
  );
}
