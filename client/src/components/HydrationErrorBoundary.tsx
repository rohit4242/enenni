"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  isHydrationError: boolean;
}

/**
 * A specialized error boundary that detects and handles hydration errors
 * by re-rendering the component tree on the client side only.
 */
export class HydrationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      isHydrationError: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a hydration error
    const isHydrationError = 
      error.message.includes("Hydration failed") ||
      error.message.includes("Text content does not match") ||
      error.message.includes("There was an error while hydrating") ||
      error.message.includes("Hydration completed but contains mismatches");
    
    return {
      hasError: true,
      isHydrationError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error only if it's not a hydration error
    if (!this.state.isHydrationError) {
      console.error("Error caught by HydrationErrorBoundary:", error, errorInfo);
    }
  }

  render() {
    // If we have a hydration error, re-render the children on the client side
    if (this.state.isHydrationError) {
      // Reset the error state
      this.state.hasError = false;
      this.state.isHydrationError = false;
      
      // Use a key based on the current time to force a complete re-render
      return (
        <div key={Date.now()}>
          {this.props.children}
        </div>
      );
    }

    // For non-hydration errors, show the fallback or the error message
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-red-500">
          Something went wrong. Please try refreshing the page.
        </div>
      );
    }

    return this.props.children;
  }
} 