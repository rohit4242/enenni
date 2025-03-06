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
import { UserCryptoWallet } from "@/lib/types/db"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

const cryptoLogos = {
  BTC: '/icons/btc.svg',
  ETH: '/icons/eth.svg',
  USDT: '/icons/usdt.svg',
  USDC: '/icons/usdc.svg'
}

export const columns: ColumnDef<UserCryptoWallet>[] = [
  {
    accessorKey: "walletAddress",
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
    cell: ({ row }) => {
      const wallet = row.original
      const logo = cryptoLogos[wallet.cryptoType as keyof typeof cryptoLogos] || '/icons/default-crypto.svg'
      
      return (
        <div className="flex items-center gap-2">
          <Image 
            src={logo}
            alt={wallet.cryptoType}
            width={20}
            height={20}
            className="w-5 h-5"
          />
          <span>{wallet.walletAddress}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "walletType",
    header: "Wallet Type",
  },
  {
    accessorKey: "nickname",
    header: "Nickname",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "APPROVED" ? "success" : "warning"}>
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(wallet.walletAddress)}>
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem>View Transactions</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]