import { z } from "zod";

export type TradeType = "BUY" | "SELL";

export interface TradeInput {
  tradeType: TradeType;
  quantity?: string;
  amount?: string;
  currentPrice: number;
  feePercentage?: number; // Optional fee percentage, defaults to 0.5%
  availableFiatBalance?: number;
  availableCryptoBalance?: number;
}

export interface TradeResult {
  calculatedAmount: number;
  calculatedQuantity: number;
  tradeFee: number;
  netAmount: number;
  error?: string;
  insufficientBalance?: {
    type: "FIAT" | "CRYPTO";
    required: number;
    available: number;
  };
}

const DEFAULT_FEE_PERCENTAGE = 0.5; // 0.5% fee

export function calculateTrade({
  tradeType,
  quantity,
  amount,
  currentPrice,
  feePercentage = DEFAULT_FEE_PERCENTAGE,
  availableFiatBalance,
  availableCryptoBalance,
}: TradeInput): TradeResult {
  try {
    // Validate inputs
    if (!currentPrice || currentPrice <= 0) {
      throw new Error("Invalid price");
    }

    if (feePercentage < 0) {
      throw new Error("Invalid fee percentage");
    }

    // Convert fee percentage to decimal
    const feeRate = feePercentage / 100;
    let calculatedAmount = 0;
    let calculatedQuantity = 0;
    let tradeFee = 0;
    let netAmount = 0;

    // Calculate based on quantity
    if (quantity && !amount) {
      const parsedQuantity = parseFloat(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        throw new Error("Invalid quantity");
      }

      calculatedQuantity = parsedQuantity;
      calculatedAmount = parsedQuantity * currentPrice;
      tradeFee = calculatedAmount * feeRate;

      if (tradeType === "BUY") {
        netAmount = calculatedAmount + tradeFee;
        
        // Check if user has enough fiat balance
        if (typeof availableFiatBalance === 'number' && netAmount > availableFiatBalance) {
          return {
            calculatedAmount,
            calculatedQuantity,
            tradeFee,
            netAmount,
            insufficientBalance: {
              type: "FIAT",
              required: netAmount,
              available: availableFiatBalance
            }
          };
        }
      } else {
        netAmount = calculatedAmount - tradeFee;
        
        // Check if user has enough crypto balance
        if (typeof availableCryptoBalance === 'number' && calculatedQuantity > availableCryptoBalance) {
          return {
            calculatedAmount,
            calculatedQuantity,
            tradeFee,
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
        tradeFee = parsedAmount * (feeRate / (1 + feeRate));
        calculatedAmount = parsedAmount - tradeFee;
        calculatedQuantity = calculatedAmount / currentPrice;
        netAmount = parsedAmount;

        // Check if user has enough fiat balance
        if (typeof availableFiatBalance === 'number' && netAmount > availableFiatBalance) {
          return {
            calculatedAmount,
            calculatedQuantity,
            tradeFee,
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
        tradeFee = calculatedAmount * feeRate;
        calculatedQuantity = calculatedAmount / currentPrice;
        netAmount = calculatedAmount - tradeFee;

        // Check if user has enough crypto balance
        if (typeof availableCryptoBalance === 'number' && calculatedQuantity > availableCryptoBalance) {
          return {
            calculatedAmount,
            calculatedQuantity,
            tradeFee,
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
      tradeFee,
      netAmount,
      error: undefined,
    };
  } catch (error) {
    return {
      calculatedAmount: 0,
      calculatedQuantity: 0,
      tradeFee: 0,
      netAmount: 0,
      error: error instanceof Error ? error.message : "Calculation error",
    };
  }
}
