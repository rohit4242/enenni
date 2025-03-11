"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { suppressHydrationErrors } from "@/lib/utils/suppress-hydration-errors"

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  suppressErrors?: boolean
}

export function ClientOnly({ 
  children, 
  fallback, 
  suppressErrors = true 
}: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  // Use useEffect to set hasMounted to true after component mounts
  useEffect(() => {
    // Optionally suppress hydration errors
    let cleanup = () => {};
    if (suppressErrors) {
      cleanup = suppressHydrationErrors();
    }
    
    // This ensures the component only renders on the client
    setHasMounted(true)
    
    // Clean up function
    return () => {
      setHasMounted(false)
      cleanup();
    }
  }, [suppressErrors])

  // If the component hasn't mounted yet, render the fallback
  if (!hasMounted) {
    return fallback || <Skeleton className="h-full w-full min-h-[100px]" />
  }

  // Once mounted, render the children
  return <>{children}</>
} 