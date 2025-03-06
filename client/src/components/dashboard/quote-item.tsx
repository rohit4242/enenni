"use client";

import { memo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Quote } from "@/hooks/use-quote";
import { motion } from "framer-motion";
import { ClientOnly } from "@/components/ClientOnly";

interface QuoteItemProps {
  quote: Quote;
  onAccept: (id: string) => void;
}

const QuoteItemContent = memo(function QuoteItemContent({ quote, onAccept }: QuoteItemProps) {
  // Use a state updated via requestAnimationFrame for smooth progress updates
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let frameId: number;
    const updateTime = () => {
      setNow(Date.now());
      frameId = requestAnimationFrame(updateTime);
    };
    frameId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const expireTime = new Date(quote.expiresAt).getTime();
  const isExpired = expireTime < now;
  const isAccepted = quote.status === "ACCEPTED";

  const totalTime = 15; // 15 seconds total
  const remainingTime = !isAccepted && !isExpired ? Math.max(0, (expireTime - now) / 1000) : 0;
  const progress = Math.min((remainingTime / totalTime) * 100, 100);
  const displayTime = Math.floor(remainingTime);

  // Animate the main card from bottom to top
  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="relative flex items-center justify-between p-4 border rounded-lg overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.3 } }}
    >
      {/* Animated progress background for active quotes */}
      {!isAccepted && !isExpired && (
        <motion.div
          className="absolute inset-0 bg-teal-500/10"
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 250, damping: 35 }}
          style={{ left: 0, right: "unset" }}
        />
      )}

      {isAccepted && <div className="absolute inset-0 bg-green-500/10" />}
      {isExpired && !isAccepted && <div className="absolute inset-0 bg-gray-300/20" />}

      <div className="relative space-y-1 z-10">
        <p className="font-medium">
          {formatCurrency(Number(quote.netAmount), quote.currency)} {quote.crypto}
          {quote.tradeType && (
            <span className="ml-2 text-xs text-muted-foreground">({quote.tradeType})</span>
          )}
        </p>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          {isAccepted ? "Accepted" : isExpired ? "Expired" : `${displayTime}s`}
          <span className="mx-2">|</span>
          <span className=" text-sm text-muted-foreground">{quote.quoteRate
            ? `Rate: ${formatCurrency(Number(quote.quoteRate), quote.currency)}`
            : "Rate: N/A"}</span>
        </div>
      </div>

      <div className="relative z-10 ml-4">
        {!isAccepted && !isExpired && (
          <Button onClick={() => onAccept(quote.id)} disabled={isExpired} size="sm">
            Accept
          </Button>
        )}

        {isAccepted && (
          <span className="text-sm font-medium text-green-600">✓ Accepted</span>
        )}
      </div>
    </motion.div>
  );
});

export const QuoteItem = memo(function QuoteItem(props: QuoteItemProps) {
  return (
    <ClientOnly fallback={
      <div className="relative flex items-center justify-between p-4 border rounded-lg overflow-hidden bg-gray-100 animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
      </div>
    }>
      <QuoteItemContent {...props} />
    </ClientOnly>
  );
});