"use client"

import { useTransactionModal } from "@/hooks/use-transaction-modal"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { TransactionForm } from "@/components/transactions/TransactionForm"
import { TransactionFormValues } from "@/lib/schemas/transaction"
import { useEffect, useState } from "react"

const CURRENCIES = [
  {
    id: "AED",
    name: "UAE Dirham",
    symbol: "AED",
    flag: "/flags/ae.svg"
  },
  {
    id: "USD",
    name: "US Dollar",
    symbol: "USD",
    flag: "/flags/us.svg"
  }
]

export function TransactionModal() {
  const { isOpen, type, onClose } = useTransactionModal()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  if (!type) return null

  const handleTransaction = async (values: TransactionFormValues) => {
    try {
      // Handle transaction logic here
      console.log(values)
      onClose()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>
          {type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
        </DialogTitle>
        <TransactionForm
          type={type}
          onSubmit={handleTransaction}
          currencies={CURRENCIES}
          showBackButton={false}
        />
      </DialogContent>
    </Dialog>
  )
}