"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet } from "@prisma/client"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Wallet>[] = [
  {
    accessorKey: "address",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Wallet Address
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "nickname",
    header: "Nickname",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "currency",
    header: "Currency",
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
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      }).format(balance)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "APPROVED" ? "success" : "secondary"}>
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const wallet = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(wallet.address)}>
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem>View Transactions</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 