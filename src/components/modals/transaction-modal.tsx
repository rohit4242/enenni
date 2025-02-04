import { useTransactionModal } from "@/hooks/use-transaction-modal"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { TransactionForm } from "@/components/transactions/TransactionForm"
import { useEffect, useState } from "react"
import { TransactionFormValues } from "@/lib/schemas/transaction"

const CURRENCIES = [
  {
    id: "USDT",
    name: "Tether USD",
    symbol: "USDT",
    icon: "₮"
  },
  {
    id: "BTC",
    name: "Bitcoin",
    symbol: "BTC",
    icon: "₿"
  },
  {
    id: "ETH",
    name: "Ethereum",
    symbol: "ETH",
    icon: "Ξ"
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
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          ...values
        }),
      })

      if (!response.ok) {
        throw new Error('Transaction failed')
      }

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
        />
      </DialogContent>
    </Dialog>
  )
} 