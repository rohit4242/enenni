"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ArrowLeft, Banknote, Notebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { transactionFormSchema, type TransactionFormValues } from "@/lib/schemas/transaction"
import { useTransactionModal } from "@/hooks/use-transaction-modal"
import Image from "next/image"

interface TransactionFormProps {
  type: "deposit" | "withdraw"
  onSubmit: (values: TransactionFormValues) => Promise<void>
  currencies: Array<{
    id: string
    name: string
    symbol: string
    flag?: string
  }>
  showBackButton?: boolean
}

export function TransactionForm({ 
  type, 
  onSubmit, 
  currencies,
  showBackButton = true 
}: TransactionFormProps) {
  const { onClose } = useTransactionModal()
  
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      currency: "",
      amount: "",
      fromAccount: "",
    },
  })

  const handleSubmit = async (values: TransactionFormValues) => {
    try {
      await onSubmit(values)
      form.reset()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      {showBackButton && (
        <Button 
          variant="ghost" 
          onClick={onClose}
          className="flex items-center gap-2 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}
      
      <h1 className="text-2xl font-semibold">
        {type === "deposit" ? "Deposit" : "Withdraw"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {type === "deposit" 
                    ? "Currency you want to deposit"
                    : "Currency you want to receive"
                  }
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-[52px]">
                      <SelectValue>
                        {field.value && (
                          <div className="flex items-center gap-2">
                            {/* <Image 
                              src={currencies.find(c => c.id === field.value)?.flag ?? ""} 
                              alt={field.value}
                              className="h-5 w-5 rounded-full"
                              width={20}
                              height={20}


                            /> */}
                                                      <Banknote className="h-5 w-5 rounded-full" />

                            {field.value}
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem 
                        key={currency.id} 
                        value={currency.id}
                      >
                        <div className="flex items-center gap-2">
                          {currency.flag && (
                            // <Image  
                            //   src={currency.flag} 
                            //   alt={currency.name}
                            //   className="h-5 w-5 rounded-full"
                            //   width={20}
                            //   height={20}
                            // />
                            <Banknote className="h-5 w-5 rounded-full" />

                          )}

                          {currency.id}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      {...field}
                      type="number"
                      placeholder="Enter amount"
                      className="h-[52px] pr-16"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {form.watch("currency") && (
                          // <Image
                          //   width={20}
                          //   height={20}
                          //   alt={form.watch("currency")}
                          //   src={currencies.find(c => c.id === form.watch("currency"))?.flag ?? ""}
                          //   className="h-5 w-5 rounded-full"

                          // />
                          <Notebook className="h-5 w-5 rounded-full" />
                        )}
                        {form.watch("currency")}
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fromAccount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{type === "deposit" ? "From" : "Withdrawal into"}</FormLabel>
                <div className="flex items-center gap-4 p-4 border rounded-md">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground">
                    W
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">wio bank</p>
                    <p className="font-medium">AE53xxxxxxxxxxxxx6664</p>
                  </div>
                  <Button 
                    type="button"
                    variant="link" 
                    className="text-primary"
                  >
                    Change
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {type === "withdraw" && (
            <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
              <p className="text-sm">Available to withdraw</p>
              <p className="text-sm font-medium">0.95 AED</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-[52px]"
            loading={form.formState.isSubmitting}
          >
            {type === "deposit" ? "Continue" : "Proceed"}
          </Button>
        </form>
      </Form>
    </div>
  )
} 