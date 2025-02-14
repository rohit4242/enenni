export function calculateTrade(
  amount: string | null,
  quantity: string | null,
  currentPrice: number,
  availableBalance: number,
  tradeType: 'BUY' | 'SELL'
) {
  if (!currentPrice) return { error: 'Price not available' };

  // Convert inputs to numbers
  const amountNum = amount ? parseFloat(amount) : null;
  const quantityNum = quantity ? parseFloat(quantity) : null;

  // Calculate based on amount or quantity
  if (amountNum) {
    const calculatedQuantity = amountNum / currentPrice;
    
    if (tradeType === 'BUY' && amountNum > availableBalance) {
      return {
        error: 'Insufficient balance',
        amount: amountNum,
        quantity: calculatedQuantity,
        total: amountNum,
      };
    }

    return {
      error: null,
      amount: amountNum,
      quantity: calculatedQuantity,
      total: amountNum,
    };
  }

  if (quantityNum) {
    const calculatedAmount = quantityNum * currentPrice;
    
    if (tradeType === 'BUY' && calculatedAmount > availableBalance) {
      return {
        error: 'Insufficient balance',
        amount: calculatedAmount,
        quantity: quantityNum,
        total: calculatedAmount,
      };
    }

    return {
      error: null,
      amount: calculatedAmount,
      quantity: quantityNum,
      total: calculatedAmount,
    };
  }

  return { error: 'Invalid input' };
} 