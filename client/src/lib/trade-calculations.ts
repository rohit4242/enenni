
export type TradeType = "BUY" | "SELL";

export interface TradeInput {
  tradeType: TradeType;
  quantity?: string;
  amount?: string;
  currentPrice: number;
  availableFiatBalance?: number;
  availableCryptoBalance?: number;
}

export interface TradeResult {
  calculatedAmount: number;
  calculatedQuantity: number;
  netAmount: number;
  error?: string;
  insufficientBalance?: {
    type: "FIAT" | "CRYPTO";
    required: number;
    available: number;
  };
}


export function calculateTrade({
  tradeType,
  quantity,
  amount,
  currentPrice,
  availableFiatBalance,
  availableCryptoBalance,
}: TradeInput): TradeResult {
  try {
    // Validate inputs
    if (!currentPrice || currentPrice <= 0) {
      throw new Error("Invalid price");
    }


    // Convert fee percentage to decimal
    let calculatedAmount = 0;
    let calculatedQuantity = 0;
    let netAmount = 0;

    // Calculate based on quantity
    if (quantity && !amount) {
      const parsedQuantity = parseFloat(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        throw new Error("Invalid quantity");
      }

      calculatedQuantity = parsedQuantity;
      calculatedAmount = parsedQuantity * currentPrice;

      if (tradeType === "BUY") {
        netAmount = calculatedAmount;
        
        // Check if user has enough fiat balance
        if (typeof availableFiatBalance === 'number' && netAmount > availableFiatBalance) {
          return {
            calculatedAmount,
            calculatedQuantity,
            netAmount,
            insufficientBalance: {
              type: "FIAT",
              required: netAmount,
              available: availableFiatBalance
            }
          };
        }
      } else {
        netAmount = calculatedAmount;
        
        // Check if user has enough crypto balance
        if (typeof availableCryptoBalance === 'number' && calculatedQuantity > availableCryptoBalance) {
          return {
            calculatedAmount,
            calculatedQuantity,
            netAmount,
            insufficientBalance: {
              type: "CRYPTO",
              required: calculatedQuantity,
              available: availableCryptoBalance
            }
          };
        }
      }
    }
    // Calculate based on amount
    else if (amount && !quantity) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Invalid amount");
      }

      if (tradeType === "BUY") {
        calculatedAmount = parsedAmount;
        calculatedQuantity = calculatedAmount / currentPrice;
        netAmount = parsedAmount;

        // Check if user has enough fiat balance
        if (typeof availableFiatBalance === 'number' && netAmount > availableFiatBalance) {
          return {
            calculatedAmount,
            calculatedQuantity,
            netAmount,
            insufficientBalance: {
              type: "FIAT",
              required: netAmount,
              available: availableFiatBalance
            }
          };
        }
      } else {
        calculatedAmount = parsedAmount;
        calculatedQuantity = calculatedAmount / currentPrice;
        netAmount = calculatedAmount;

        // Check if user has enough crypto balance
        if (typeof availableCryptoBalance === 'number' && calculatedQuantity > availableCryptoBalance) {
          return {
            calculatedAmount,
            calculatedQuantity,
            netAmount,
            insufficientBalance: {
              type: "CRYPTO",
              required: calculatedQuantity,
              available: availableCryptoBalance
            }
          };
        }
      }
    } else {
      throw new Error("Either quantity or amount must be provided");
    }

    return {
      calculatedAmount,
      calculatedQuantity,
      netAmount,
      error: undefined,
    };
  } catch (error) {
    return {
      calculatedAmount: 0,
      calculatedQuantity: 0,
      netAmount: 0,
      error: error instanceof Error ? error.message : "Calculation error",
    };
  }
}
