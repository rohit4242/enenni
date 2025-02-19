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
import { Order } from "@prisma/client"

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
      return <div>{new Date(row.getValue("createdAt")).toLocaleDateString()}</div>
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          type === "BUY" 
            ? "bg-green-50 text-green-600" 
            : "bg-red-50 text-red-600"
        }`}>
          {type}
        </div>
      )
    },
  },
  {
    accessorKey: "asset",
    header: "Asset",
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.original.quantity.toString())
      return <div className="font-medium">{amount.toFixed(2)}</div>
    },
  },
  {
    accessorKey: "currency",
    enableHiding: true,
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"))
      const currency = row.getValue("currency") as string
      
      // Handle crypto currencies differently
      if (currency === "USDT") {
        return <div className="font-medium">{amount.toFixed(2)} USDT</div>
      }

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency === "USDT" ? "USD" : currency,
      }).format(amount)

      return <div className="font-medium">{formatted}</div>
    },
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