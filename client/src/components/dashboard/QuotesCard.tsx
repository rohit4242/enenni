"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clock, Loader2, Trash2 } from "lucide-react";
import { useQuotes, useAcceptQuote, useClearQuotes } from "@/hooks/use-quotes";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuoteItem } from "./quote-item";


export function QuotesCard() {
  const { data: quotes, isLoading, error, refetch } = useQuotes();
  const { mutate: acceptQuote, isPending: isAcceptingQuote } = useAcceptQuote();
  const { mutate: clearQuotes, isPending: isClearingQuotes } = useClearQuotes();
  const { toast } = useToast();
  
  // Add this useEffect to periodically check for expired quotes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [refetch]);

  const activeQuotes = quotes?.filter(
    (quote) => quote.status === "ACTIVE" && new Date(quote.expiresAt) > new Date()
  );
  
  const expiredQuotes = quotes?.filter(
    (quote) => quote.status === "EXPIRED" || (quote.status === "ACTIVE" && new Date(quote.expiresAt) <= new Date())
  );
  
  const acceptedQuotes = quotes?.filter(
    (quote) => quote.status === "ACCEPTED"
  );

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await acceptQuote(quoteId);
      toast({
        title: "Success",
        description: "Quote accepted successfully",
      });
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
            <TabsTrigger value="accepted">
              Accepted ({acceptedQuotes?.length || 0})
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
          <TabsContent value="accepted">
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {acceptedQuotes?.map((quote) => (
                  <QuoteItem
                    key={quote.id}
                    quote={quote}
                    onAccept={handleAcceptQuote}
                    isAcceptingQuote={isAcceptingQuote}
                  />
                ))}
                {!acceptedQuotes?.length && (
                  <div className="text-center text-muted-foreground p-4">
                    No accepted quotes
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
