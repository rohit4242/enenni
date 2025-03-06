"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { UserBankAccount } from "@/lib/types/db";

export const columns: ColumnDef<UserBankAccount>[] = [
  {
    accessorKey: "accountHolderName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Account Holder
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "bankName",
    header: "Bank Name",
  },
  {
    accessorKey: "accountCurrency",
    header: "Currency",
  },
  {
    accessorKey: "iban",
    header: "Account Number / IBAN",
    cell: ({ row }) => {
      const iban = row.getValue("iban") as string;
      const accountNumber = row.original.accountNumber;
      const displayValue = iban || accountNumber || "N/A";

      return (
        <div className="flex items-center gap-2">
          <span className="font-mono">{displayValue}</span>
          {displayValue !== "N/A" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                navigator.clipboard.writeText(displayValue);
                toast({
                  title: "Copied",
                  description: "Account details copied to clipboard",
                });
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "bankCountry",
    header: "Country",
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = status === "APPROVED" ? "success" : "destructive";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const bankAccount = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                const value = bankAccount.iban || bankAccount.accountNumber;
                if (value) {
                  navigator.clipboard.writeText(value);
                  toast({
                    title: "Copied",
                    description: "Account details copied to clipboard",
                  });
                }
              }}
            >
              Copy Account Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                (window.location.href = `/bank-accounts/${bankAccount.id}`)
              }
            >
              View Transactions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
