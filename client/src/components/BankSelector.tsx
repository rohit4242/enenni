"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Label } from "./ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

interface Bank {
  id: string
  name: string
  accountNumber: string
  initial: string
  color: string
}

interface BankSelectorProps {
  banks: Bank[]
  selectedBank: Bank | null
  onBankChange: (bank: Bank) => void
  label?: string
  showAddBank?: boolean
  onAddBank?: () => void
}

export function BankSelector({
  banks,
  selectedBank,
  onBankChange,
  label = "From",
  showAddBank = true,
  onAddBank
}: BankSelectorProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center justify-between">
        {selectedBank && (
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedBank.color} text-white`}
            >
              {selectedBank.initial}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">{selectedBank.name}</div>
              <div className="text-xs text-muted-foreground">{selectedBank.accountNumber}</div>
            </div>
          </div>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              Change
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="end">
            <Card className="border-0">
              <div className="space-y-1 p-2">
                {banks.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-accent"
                    onClick={() => {
                      onBankChange(bank)
                      setOpen(false)
                    }}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${bank.color} text-white`}
                    >
                      {bank.initial}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{bank.name}</div>
                      <div className="text-xs text-muted-foreground">{bank.accountNumber}</div>
                    </div>
                    {selectedBank?.id === bank.id && <Check className="h-4 w-4 text-blue-600" />}
                  </div>
                ))}
                {showAddBank && (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-blue-600"
                    onClick={onAddBank}
                  >
                    <span className="mr-2">+</span> Add a bank account
                  </Button>
                )}
              </div>
            </Card>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}