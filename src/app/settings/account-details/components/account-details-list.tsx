"use client"

import { ChevronDown } from "lucide-react"
import Image from "next/image"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState } from "react"

interface AccountDetail {
  id: string
  currency: string
  title: string
  description: string
  flag: string
  details: {
    label: string
    value: string
  }[]
}

const accountDetails: AccountDetail[] = [
  {
    id: "aed",
    currency: "AED",
    title: "AED account details",
    description: "For transfer from any bank account.",
    flag: "/logo_1.svg",
    details: [
      { label: "Account Name", value: "VEDARK SOUK LLC" },
      { label: "Account Number", value: "1234567890" },
      { label: "IBAN", value: "AE070331234567890123456" },
      { label: "Bank Name", value: "First Abu Dhabi Bank" },
      { label: "Swift Code", value: "FABAEAAD" },
    ]
  },
  {
    id: "usd1",
    currency: "USD",
    title: "USD account details",
    description: "For transfer from any bank account, except Zand USD accounts.",
    flag: "/logo_1.svg",
    details: [
      { label: "Account Name", value: "VEDARK SOUK LLC" },
      { label: "Account Number", value: "0987654321" },
      { label: "IBAN", value: "AE070331234567890123457" },
      { label: "Bank Name", value: "First Abu Dhabi Bank" },
      { label: "Swift Code", value: "FABAEAAD" },
    ]
  },
  {
    id: "usd2",
    currency: "USD",
    title: "USD account details",
    description: "For transfer from your Zand USD bank account.",
    flag: "/logo_1.svg",
    details: [
      { label: "Account Name", value: "VEDARK SOUK LLC" },
      { label: "Account Number", value: "5555555555" },
      { label: "IBAN", value: "AE070331234567890123458" },
      { label: "Bank Name", value: "Zand Bank" },
      { label: "Swift Code", value: "ZANDUAAD" },
    ]
  }
]

export function AccountDetailsList() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id]
    )
  }

  return (
    <div className="space-y-4">
      {accountDetails.map((account) => (
        <Collapsible
          key={account.id}
          open={openItems.includes(account.id)}
          onOpenChange={() => toggleItem(account.id)}
          className="border rounded-lg"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 overflow-hidden rounded-full">
                <Image
                  src={account.flag}
                  alt={`${account.currency} flag`}
                  width={32}
                  height={32}
                />
              </div>
              <div className="text-left">
                <h4 className="text-base font-medium">{account.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {account.description}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${
                openItems.includes(account.id) ? "transform rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 pt-0 space-y-4">
            {account.details.map((detail, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {detail.label}
                </span>
                <span className="text-sm font-medium">{detail.value}</span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
} 