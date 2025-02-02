'use client';
import { BuySellCard } from './components/BuySellCard';
import { QuotesCard } from './components/QuotesCard';
import { LiveChart } from '@/components/LiveChart';

type Quote = {
  id: string;
  amount: string | number;
  currency: string;
  quoteRate: string | number;
  status: 'ACTIVE' | 'EXPIRED' | 'USED';
  createdAt: string;
  expiresAt: string;
};

export default function DashboardPage() {
  const handleQuoteCreated = (newQuote: Quote) => {
    // Handle the new quote in QuotesCard component directly
    console.log('New quote created:', newQuote);
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <BuySellCard onQuoteCreated={handleQuoteCreated} />
        <QuotesCard />
      </div>
      <LiveChart />
    </div>
  );
}
