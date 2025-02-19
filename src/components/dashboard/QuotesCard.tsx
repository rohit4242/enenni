"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, Clock, Loader2, Trash2 } from "lucide-react";
import { useQuotes, useAcceptQuote, useClearQuotes } from "@/hooks/use-quotes";
import { Skeleton } from "@/components/ui/skeleton";
import { Quote } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// type Quote = {
//   id: string;
//   amount: string | number;
//   currency: string;
//   quoteRate: string | number;
//   status: "ACTIVE" | "EXPIRED" | "USED";
//   createdAt: string;
//   expiresAt: string;
// };

function QuoteItem({
  quote,
  onAccept,
  isAcceptingQuote,
}: {
  quote: Quote;
  onAccept: (id: string) => void;
  isAcceptingQuote: boolean;
}) {
  const isExpired = new Date(quote.expiresAt) < new Date();
  const timeLeft = Math.max(
    0,
    Math.floor((new Date(quote.expiresAt).getTime() - Date.now()) / 1000)
  );
  const totalTime = 7; // 30 seconds total
  const progress = (timeLeft / totalTime) * 100;

  return (
    <div className="relative flex items-center justify-between p-4 border rounded-lg overflow-hidden">
      {/* Progress background */}
      <div
        className="absolute inset-0 bg-teal-500/10 transition-all duration-1000 ease-linear"
        style={{
          width: `${progress}%`,
          left: 0,
          right: "unset",
          transition: "width 1s linear",
        }}
      />
      {/* Content */}
      <div className="relative space-y-1 z-10">
        <p className="font-medium">
          {quote.amount.toString()} {quote.currency}
        </p>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          {isExpired ? "Expired" : `${timeLeft}s`}
        </div>
      </div>
      <Button
        onClick={() => onAccept(quote.id)}
        disabled={isExpired}
        size="sm"
        className="relative ml-4 z-10"
        loading={isAcceptingQuote}
      >
        Accept
      </Button>
    </div>
  );
}

export function QuotesCard() {
  const { data: quotes, isLoading, error } = useQuotes();
  const { mutate: acceptQuote, isPending: isAcceptingQuote } = useAcceptQuote();
  const { mutate: clearQuotes, isPending: isClearingQuotes } = useClearQuotes();
  const { toast } = useToast();

  const activeQuotes = quotes?.filter(
    (quote) => quote.status === "ACTIVE" && new Date(quote.expiresAt) > new Date()
  );
  const expiredQuotes = quotes?.filter(
    (quote) => quote.status === "EXPIRED" || new Date(quote.expiresAt) <= new Date()
  );

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await acceptQuote(quoteId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    try {
      await clearQuotes();
      toast({
        title: "Success",
        description: "All quotes cleared successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear quotes",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <Skeleton className="h-[200px] w-full" />;
  if (error) return <div>Failed to load quotes</div>;

  return (
    <Card className="h-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Quotes</CardTitle>
        <Button
          onClick={handleClearAll}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isClearingQuotes}
        >
          {isClearingQuotes ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Clear All
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">
              Active ({activeQuotes?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired ({expiredQuotes?.length || 0})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <ScrollArea className="h-48">
              <div className="space-y-4">
                {activeQuotes?.map((quote) => (
                  <QuoteItem
                    key={quote.id}
                    quote={quote}
                    onAccept={handleAcceptQuote}
                    isAcceptingQuote={isAcceptingQuote}
                  />
                ))}
                {!activeQuotes?.length && (
                  <div className="text-center text-muted-foreground p-4">
                    No active quotes
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="expired">
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {expiredQuotes?.map((quote) => (
                  <QuoteItem
                    key={quote.id}
                    quote={quote}
                    onAccept={handleAcceptQuote}
                    isAcceptingQuote={isAcceptingQuote}
                  />
                ))}
                {!expiredQuotes?.length && (
                  <div className="text-center text-muted-foreground p-4">
                    No expired quotes
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
