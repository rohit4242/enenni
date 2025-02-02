"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNewBankAccountModal } from "@/hooks/use-new-bank-account";
import { useState } from "react";
import { Modal } from "../ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface NewBankAccountModalProps {}

const formSchema = z.object({
  accountHolderName: z.string().min(2),
  bankName: z.string().min(2),
  currency: z.string().min(1),
  accountType: z.enum(["IBAN", "ACCOUNT_NUMBER"]),
  iban: z.string().optional(),
  verifyIban: z.string().optional(),
  bankAddress: z.string().min(2),
  bankCountry: z.string().min(1),
  proofDocument: z.instanceof(File).optional(),
});

export const NewBankAccount: React.FC<NewBankAccountModalProps> = ({}) => {
  const newBankAccountModal = useNewBankAccountModal();

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountHolderName: "Vedark Souk LLC",
      bankName: "",
      currency: "",
      accountType: "IBAN",
      iban: "",
      verifyIban: "",
      bankAddress: "",
      bankCountry: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      // TODO: api call
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Bank Account"
      description="Add a new bank account"
      isOpen={newBankAccountModal.isOpen}
      onClose={newBankAccountModal.onClose}
    >
      <ScrollArea className="h-full w-full">
        <div className="max-h-[50vh] w-auto">
          <div className="space-y-4 py-2 pb-4 px-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="accountHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of account holder</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input disabled={true} {...field} />
                        </FormControl>
                        <Button variant="link" type="button">
                          Change
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank name</FormLabel>
                        <FormControl>
                          <Input disabled={loading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account currency</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={loading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="USD">
                                  USD - US Dollar
                                </SelectItem>
                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                <SelectItem value="GBP">
                                  GBP - British Pound
                                </SelectItem>
                                <SelectItem value="JPY">
                                  JPY - Japanese Yen
                                </SelectItem>
                                <SelectItem value="AUD">
                                  AUD - Australian Dollar
                                </SelectItem>
                                <SelectItem value="CAD">
                                  CAD - Canadian Dollar
                                </SelectItem>
                                <SelectItem value="CHF">
                                  CHF - Swiss Franc
                                </SelectItem>
                                <SelectItem value="CNY">
                                  CNY - Chinese Yuan
                                </SelectItem>
                                <SelectItem value="AED">
                                  AED - UAE Dirham
                                </SelectItem>
                                <SelectItem value="SGD">
                                  SGD - Singapore Dollar
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provide</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loading}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="IBAN" id="iban" />
                            <label htmlFor="iban">IBAN</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="ACCOUNT_NUMBER"
                              id="account-number"
                            />
                            <label htmlFor="account-number">
                              Account number (if IBAN not available)
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="iban"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IBAN</FormLabel>
                        <FormControl>
                          <Input disabled={loading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="verifyIban"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verify IBAN</FormLabel>
                        <FormControl>
                          <Input disabled={loading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bankAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank address</FormLabel>
                      <FormControl>
                        <textarea
                          className="w-full p-2 border rounded-md"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank country</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="GB">United Kingdom</SelectItem>
                              <SelectItem value="DE">Germany</SelectItem>
                              <SelectItem value="FR">France</SelectItem>
                              <SelectItem value="IT">Italy</SelectItem>
                              <SelectItem value="ES">Spain</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                              <SelectItem value="JP">Japan</SelectItem>
                              <SelectItem value="CN">China</SelectItem>
                              <SelectItem value="IN">India</SelectItem>
                              <SelectItem value="AE">
                                United Arab Emirates
                              </SelectItem>
                              <SelectItem value="SG">Singapore</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proofDocument"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Upload proof</FormLabel>
                      <FormControl>
                        <div className="border rounded-md p-4">
                          <input
                            type="file"
                            onChange={(e) => onChange(e.target.files?.[0])}
                            {...field}
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            Eg: Cancelled cheque, bank statement, IBAN
                            certificate etc.
                          </p>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                  <Button
                    disabled={loading}
                    variant="outline"
                    onClick={newBankAccountModal.onClose}
                  >
                    Cancel
                  </Button>
                  <Button disabled={loading} type="submit">
                    Submit
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </ScrollArea>
    </Modal>
  );
};
