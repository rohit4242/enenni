"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Order } from "@/lib/types/db"

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "referenceId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      if (typeof window === 'undefined') {
        return <span>Loading...</span>;
      }
      const date = new Date(row.getValue("createdAt"))
      return <span>{date.toLocaleString()}</span>
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge variant={type === "BUY" ? "default" : "secondary"}>
          {type}
        </Badge>
      )
    },
  },
  {
    accessorKey: "asset",
    header: "Crypto",
    cell: ({ row }) => {
      const asset = row.getValue("asset") as string
      return <span className="font-medium">{asset}</span>
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number
      const asset = row.getValue("asset") as string
      return (
        <span className="font-medium">
          {quantity} {asset}
        </span>
      )
    },
  },
  {
    accessorKey: "pricePerToken",
    header: "Price per token",
    cell: ({ row }) => {
      const price = row.getValue("pricePerToken") as number
      const currency = row.getValue("currency") as string
      return <span>{formatCurrency(price, currency)}</span>
    },
  },
  {
    accessorKey: "currency",
    enableHiding: true,
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number
      const currency = row.getValue("currency") as string
      return <span className="font-medium">{formatCurrency(amount, currency)}</span>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge 
          variant={
            status === "COMPLETED" 
              ? "success" 
              : status === "PENDING" 
              ? "warning" 
              : "destructive"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a
                href={`/api/orders/${order.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/orders/${order.id}`} className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                View Details
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 