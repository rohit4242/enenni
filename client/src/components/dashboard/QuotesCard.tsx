"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { useQuoteStore } from "@/hooks/use-quote";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuoteItem } from "./quote-item";
import { createOrder } from "@/lib/api/orders";


export function QuotesCard() {
  const { quotes, acceptQuote, clearQuotes, updateExpiredQuotes, getQuote } = useQuoteStore();
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      updateExpiredQuotes();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateExpiredQuotes]);

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
    acceptQuote(quoteId);
    const quote = getQuote(quoteId);
    if (quote) {
      const order = await createOrder({
        type: quote.tradeType,
        asset: quote.crypto,
        quantity: quote.calculatedQuantity,
        pricePerToken: quote.quoteRate,
        totalAmount: quote.netAmount,
        currency: quote.currency,
        referenceId: quote.id,
      });
      if (order) {
        toast({
          title: "Quote Accepted",
          description: "Quote accepted successfully",
        });
      }
    }
  };

  const handleClearAll = async () => {
    clearQuotes();
    toast({
      title: "Quotes Cleared",
      description: "All quotes cleared successfully",
    });
  };


  return (
    <Card className="h-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Quotes</CardTitle>
        <Button
          onClick={handleClearAll}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
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
                  />
                ))}
                {activeQuotes?.length === 0 && (
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
                  />
                ))}
                {expiredQuotes?.length === 0 && (
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
                  />
                ))}
                {acceptedQuotes?.length === 0 && (
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
