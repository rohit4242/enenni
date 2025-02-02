'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from "next-auth/react";
import LoginButton from "@/components/auth/login-button";

const formSchema = z.object({
  currency: z.string().min(1, 'Please select a currency'),
  quantity: z.string().optional(),
  amount: z.string().optional(),
}).refine((data) => data.quantity || data.amount, {
  message: "Either quantity or amount must be provided",
});

const CURRENCIES = [
  { id: 'AED', name: 'United Arab Emirates Dirham (AED)', balance: 50000 },
  { id: 'USDT', name: 'Tether USD (USDT)', balance: 15000 },
];

// Add proper type for the quote
interface Quote {
  id: string;
  amount: string | number;
  currency: string;
  quoteRate: string | number;
  status: 'ACTIVE' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
}

export function BuySellCard({ onQuoteCreated }: { onQuoteCreated: (quote: Quote) => void }) {
  const { data: session } = useSession();
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: '',
      quantity: '',
      amount: '',
    },
  });

  const selectedCurrency = CURRENCIES.find(
    curr => curr.id === form.watch('currency')
  );

  const handleRequestQuote = async (values: z.infer<typeof formSchema>) => {
    if (!session) {
      return toast({
        title: "Authentication required",
        description: "Please sign in to request a quote",
        variant: "destructive",
      });
    }

    try {
      setLoading(true);
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, tradeType }),
      });

      if (!response.ok) throw new Error('Failed to get quote');

      const quote = await response.json();
      onQuoteCreated(quote);
      toast({
        title: "Quote received",
        description: "Your quote is valid for 30 seconds",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full h-auto">
      <CardHeader>
        <CardTitle>Buy/Sell</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {!session ? (
          <div className="text-center p-4">
            <p className="mb-4">Please sign in to trade</p>
            <LoginButton mode="modal" asChild>
              <Button>
                Sign in to Trade
              </Button>
            </LoginButton>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRequestQuote)} className="space-y-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.id} value={currency.id}>
                              {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col md:flex-row gap-2">
                <Button
                  type="button"
                  variant={tradeType === 'BUY' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setTradeType('BUY')}
                >
                  Buy
                </Button>
                <Button
                  type="button"
                  variant={tradeType === 'SELL' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setTradeType('SELL')}
                >
                  Sell
                </Button>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-2">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Quantity"
                          type="number"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue('amount', '');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
                <span className="text-muted-foreground">or</span>
              
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Amount"
                          type="number"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue('quantity', '');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="h-10" disabled={loading}>
                  {loading ? 'Loading...' : 'Request Quote'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        )}

        {selectedCurrency && (
          <p className="mt-2 text-sm text-muted-foreground">
            Available to trade: {selectedCurrency.balance} {selectedCurrency.id}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

