"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export const columns: ColumnDef<any>[] = [
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
      const amount = row.getValue("amount")
      const type = row.getValue("type")
      return (
        <div className="flex items-center gap-2">
          <span className={type === "WITHDRAWAL" ? "text-red-500" : "text-green-500"}>
            {type === "WITHDRAWAL" ? "↗" : "↙"}
          </span>
          {amount} {row.original.currency}
        </div>
      )
    },
  },
  {
    accessorKey: "reference",
    header: "Reference",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          status === "COMPLETED" 
            ? "bg-green-50 text-green-600" 
            : status === "PENDING" 
            ? "bg-yellow-50 text-yellow-600" 
            : "bg-red-50 text-red-600"
        }`}>
          {status}
        </div>
      )
    },
  },
  {
    accessorKey: "date",
    header: "Date & Time",
    cell: ({ row }) => new Date(row.getValue("date")).toLocaleString(),
  },
] 