"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Quote } from "@prisma/client";

interface QuoteItemProps {
  quote: Quote;
  onAccept: (id: string) => void;
  isAcceptingQuote: boolean;
}

// Using memo to prevent unnecessary re-renders
export const QuoteItem = memo(function QuoteItem({
  quote,
  onAccept,
  isAcceptingQuote,
}: QuoteItemProps) {
  const isExpired = new Date(quote.expiresAt) < new Date();
  const isAccepted = quote.status === "ACCEPTED";
  
  // Calculate remaining time only if quote is active
  const timeLeft = !isAccepted && !isExpired
    ? Math.max(0, Math.floor((new Date(quote.expiresAt).getTime() - Date.now()) / 1000))
    : 0;
    
  const totalTime = 15; // 15 seconds total
  const progress = (timeLeft / totalTime) * 100;

  return (
    <div className="relative flex items-center justify-between p-4 border rounded-lg overflow-hidden">
      {/* Progress background (only for active quotes) */}
      {!isAccepted && !isExpired && (
        <div
          className="absolute inset-0 bg-teal-500/10 transition-all duration-1000 ease-linear"
          style={{
            width: `${progress}%`,
            left: 0,
            right: "unset",
          }}
        />
      )}
      
      {/* Accepted quotes background */}
      {isAccepted && <div className="absolute inset-0 bg-green-500/10" />}
      
      {/* Expired quotes background */}
      {isExpired && !isAccepted && <div className="absolute inset-0 bg-gray-300/20" />}
      
      {/* Content */}
      <div className="relative space-y-1 z-10">
        <p className="font-medium">
          {formatCurrency(Number(quote.amount), quote.currency)} {quote.crypto}
        </p>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          {isAccepted ? "Accepted" : isExpired ? "Expired" : `${timeLeft}s`}
        </div>
      </div>
      
      {/* Show button only for active, non-expired quotes */}
      {!isAccepted && !isExpired && (
        <Button
          onClick={() => onAccept(quote.id)}
          disabled={isExpired || isAcceptingQuote}
          size="sm"
          className="relative ml-4 z-10"
        >
          {isAcceptingQuote ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : "Accept"}
        </Button>
      )}
      
      {/* Show confirmation for accepted quotes */}
      {isAccepted && (
        <span className="relative z-10 ml-4 text-sm font-medium text-green-600">
          ✓ Accepted
        </span>
      )}
    </div>
  );
}); 