import { NextResponse } from 'next/server';
import db from '@/lib/db';


export async function POST(req: Request) {
  try {
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await req.json();
    const { currency, quantity, amount, tradeType } = body;

    if (!currency || (!quantity && !amount) || !tradeType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate quote amount and rate
    const quoteRate = currency === 'USDT' ? 3.6393789 : 3.67;
    const finalAmount = amount || (Number(quantity) * quoteRate).toString();

    const quote = await db.quote.create({
      data: {
        amount: finalAmount,
        currency,
        quoteRate,
        type: tradeType,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 7000), // 30 seconds
      },
    });

    return NextResponse.json(quote);
  } catch (error) {
    console.error('[QUOTES_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const quotes = await db.quote.findMany({
      where: {
        status: {
          not: 'USED'  // Show both ACTIVE and EXPIRED quotes
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error('[QUOTES_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await db.quote.deleteMany({
      where: {
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({ message: 'All quotes cleared successfully' });
  } catch (error) {
    console.error('[QUOTES_DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to clear quotes' },
      { status: 500 }
    );
  }
} 