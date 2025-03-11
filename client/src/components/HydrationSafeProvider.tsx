"use client";

import { useEffect, useState, ReactNode } from "react";
import { suppressHydrationErrors } from "@/lib/utils/suppress-hydration-errors";

interface HydrationSafeProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A global provider that ensures consistent rendering between server and client
 * by only rendering children after hydration is complete.
 * 
 * It also suppresses hydration error messages in the console.
 */
export function HydrationSafeProvider({ 
  children, 
  fallback 
}: HydrationSafeProviderProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    // Suppress hydration errors
    const cleanup = suppressHydrationErrors();
    
    // Mark as mounted after hydration
    setIsMounted(true);
    
    return () => {
      // Only call the cleanup function for error suppression
      // Don't reset the mounted state to avoid re-renders
      cleanup();
    };
  }, []);
  
  // During SSR and initial client render, show fallback or nothing
  if (!isMounted) {
    return fallback || null;
  }
  
  // After hydration, render children
  return <>{children}</>;
} 