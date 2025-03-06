"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ClientOnly } from "@/components/ClientOnly";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

// Inner component that will be wrapped with ClientOnly
function AuthGuardContent({ children, requiredRole }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Wait for authentication check to complete
    if (!isLoading) {
      // Redirect if not authenticated
      if (!isAuthenticated) {
        router.push("/auth/login");
      }
      
      // Check role if required
      if (requiredRole && user?.role !== requiredRole) {
        router.push("/unauthorized");
      }
    }
  }, [isLoading, isAuthenticated, user, router, requiredRole]);
  
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    );
  }
  
  // Show nothing if not authenticated or role check fails
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null;
  }
  
  return <>{children}</>;
}

// The exported component that uses ClientOnly
export function AuthGuard(props: AuthGuardProps) {
  return (
    <ClientOnly fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AuthGuardContent {...props} />
    </ClientOnly>
  );
} 