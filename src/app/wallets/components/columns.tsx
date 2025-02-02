"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Transaction } from "@prisma/client"

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number | string
      const type = row.getValue("type") as string
      return (
        <div className="flex items-center gap-2">
          <span className={type === "WITHDRAWAL" ? "text-red-500" : "text-green-500"}>
            {type === "WITHDRAWAL" ? "↗" : "↙"}
          </span>
          {amount.toString()} {row.original.currency}
        </div>
      )
    },
  },
  {
    accessorKey: "transactionHash",
    header: "Hash",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
  },
] 