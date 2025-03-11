"use client";

/**
 * Utility to suppress React hydration errors in the console
 * This should be used as a temporary solution while fixing the actual hydration issues
 */
export function suppressHydrationErrors() {
  if (typeof window !== 'undefined') {
    // Only override console.error once
    if ((window as any).__hydrationErrorsSuppressionActive) {
      return () => {}; // Return no-op if already active
    }
    
    // Mark as active
    (window as any).__hydrationErrorsSuppressionActive = true;
    
    // Store the original console.error
    const originalConsoleError = console.error;
    
    // Override console.error to filter out hydration warnings
    console.error = (...args) => {
      // Check if this is a hydration error
      const isHydrationError = args.some(arg => 
        typeof arg === 'string' && (
          arg.includes('Hydration failed because') ||
          arg.includes('Warning: Text content did not match') ||
          arg.includes('Warning: An error occurred during hydration') ||
          arg.includes('There was an error while hydrating') ||
          arg.includes('Hydration completed but contains mismatches') ||
          arg.includes('A tree hydrated but some attributes') ||
          arg.includes('Maximum update depth exceeded') // Also suppress max update depth errors
        )
      );
      
      // Don't log hydration errors
      if (!isHydrationError) {
        originalConsoleError(...args);
      }
    };
    
    // Return a cleanup function to restore the original console.error
    return () => {
      console.error = originalConsoleError;
      (window as any).__hydrationErrorsSuppressionActive = false;
    };
  }
  
  // Return a no-op cleanup function for SSR
  return () => {};
} 