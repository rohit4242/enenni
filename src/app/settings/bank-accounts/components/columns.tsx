"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BankAccount } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

export const columns: ColumnDef<BankAccount>[] = [
  {
    accessorKey: "accountHolder",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Account Holder
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "bankName",
    header: "Bank Name",
  },
  {
    accessorKey: "currency",
    header: "Currency",
  },
  {
    accessorKey: "iban",
    header: "IBAN",
    cell: ({ row }) => {
      const iban = row.getValue("iban") as string
      const accountNumber = row.original.accountNumber
      const displayValue = iban || accountNumber || "N/A"
      
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono">{displayValue}</span>
          {displayValue !== "N/A" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                navigator.clipboard.writeText(displayValue)
                toast({
                  title: "Copied",
                  description: "Account details copied to clipboard",
                })
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "bankCountry",
    header: "Country",
  },
  {
    accessorKey: "balance",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Balance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const balance = parseFloat(row.getValue("balance"))
      const currency = row.getValue("currency") as string
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(balance)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const bankAccount = row.original

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
                const value = bankAccount.iban || bankAccount.accountNumber
                if (value) {
                  navigator.clipboard.writeText(value)
                  toast({
                    title: "Copied",
                    description: "Account details copied to clipboard",
                  })
                }
              }}
            >
              Copy Account Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.location.href = `/bank-accounts/${bankAccount.id}`}
            >
              View Transactions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 