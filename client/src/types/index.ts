// src/types/index.ts
export type Transaction = {
    amount: number;
    currency: string;
    dateTime: string;
    transactionHash: string;
    destination: string;
    status: "COMPLETED" | "PENDING" | "FAILED";
  }
  
  export type SortDirection = {
    amount: "asc" | "desc";
    dateTime: "asc" | "desc";
    status: "asc" | "desc";
  }