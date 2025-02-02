"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, Clock, Loader2 } from "lucide-react";

type Quote = {
  id: string;
  amount: string | number;
  currency: string;
  quoteRate: string | number;
  status: 'ACTIVE' | 'EXPIRED' | 'USED';
  createdAt: string;
  expiresAt: string;
};

function QuoteItem({
  quote,
  onConfirm,
  loading,
}: {
  quote: Quote;
  onConfirm: (id: string) => void;
  loading: boolean;
}) {
  const isExpired = new Date(quote.expiresAt) < new Date();
  const timeLeft = Math.max(0, Math.floor((new Date(quote.expiresAt).getTime() - Date.now()) / 1000));
  const totalTime = 5; // 30 seconds total
  const progress = (timeLeft / totalTime) * 100;

  return (
    <div className="relative flex items-center justify-between p-4 border rounded-lg overflow-hidden">
      {/* Progress background */}
      <div
        className="absolute inset-0 bg-teal-500/10 transition-all duration-1000 ease-linear"
        style={{
          width: `${progress}%`,
          left: 0,
          right: 'unset',
          transition: 'width 1s linear'
        }}
      />
      {/* Content */}
      <div className="relative space-y-1 z-10">
        <p className="font-medium">
          {quote.amount} {quote.currency}
        </p>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          {isExpired ? "Expired" : `${timeLeft}s`}
        </div>
      </div>
      <Button
        onClick={() => onConfirm(quote.id)}
        disabled={isExpired || loading}
        size="sm"
        className="relative ml-4 z-10"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : (
          <>
            <Check className="mr-1 h-4 w-4" />
            Confirm
          </>
        )}
      </Button>
    </div>
  );
}

export function QuotesCard() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState<Record<string, boolean>>({});
  const [clearingQuotes, setClearingQuotes] = useState(false);
  const { toast } = useToast();

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes');
      if (!response.ok) throw new Error('Failed to fetch quotes');
      const data = await response.json();
      setQuotes(data); // This will only contain ACTIVE quotes from the API
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 1000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleConfirmTrade = async (quoteId: string) => {
    try {
      setLoadingQuotes(prev => ({ ...prev, [quoteId]: true }));
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to confirm trade');
      }

      toast({
        title: "Trade Confirmed",
        description: "Your trade has been successfully executed.",
      });
      
      setQuotes(current => current.filter(q => q.id !== quoteId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingQuotes(prev => ({ ...prev, [quoteId]: false }));
    }
  };

  const handleClearQuotes = async () => {
    try {
      setClearingQuotes(true);
      const response = await fetch('/api/quotes', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to clear quotes');

      setQuotes([]);
      toast({
        title: "Quotes Cleared",
        description: "All quotes have been successfully cleared.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear quotes",
        variant: "destructive",
      });
    } finally {
      setClearingQuotes(false);
    }
  };

  return (
    <Card className="h-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Active Quotes</CardTitle>
        {quotes.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearQuotes}
            disabled={clearingQuotes}
          >
            {clearingQuotes ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Clearing...
              </div>
            ) : (
              "Clear All"
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-4">
            {quotes.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">
                No active quotes
              </div>
            ) : (
              quotes.map((quote) => (
                <QuoteItem
                  key={quote.id}
                  quote={quote}
                  onConfirm={handleConfirmTrade}
                  loading={loadingQuotes[quote.id]}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
