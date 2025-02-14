"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCryptoDepositModal,
  cryptoDepositSchema,
} from "@/hooks/use-crypto-deposit-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createTransaction } from "@/actions/transactions";
import { Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { toast } from "@/hooks/use-toast";
import { useCryptoWalletAddress } from "@/hooks/use-crypto-wallet-address";
import { CryptoType } from "@prisma/client";
import { Input } from "../ui/input";

interface CryptoDepositModalProps {
  cryptoType?: string;
  onSuccess?: () => void;
}
const NETWORKS = {
  BTC: ["Tron", "Ethereum"],
  ETH: ["Ethereum", "Tron"],
  USDT: ["Tron", "Ethereum"],
  USDC: ["Tron", "Ethereum"],
};

const CRYPTO_ICONS = {
  USDT: "💎",
  BTC: "₿",
  ETH: "Ξ",
  USDC: "$",
};

export function CryptoDepositModal({
  cryptoType,
  onSuccess,
}: CryptoDepositModalProps) {
  const { isOpen, onClose } = useCryptoDepositModal();
  const { walletAddress, loading, error, refetch } = useCryptoWalletAddress(
    cryptoType || ""
  );
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(cryptoDepositSchema),
    defaultValues: {
      cryptoType: cryptoType || "",
      network: "",
      walletAddress: walletAddress || "",
      amount: "",
    },
  });

  const networks = cryptoType
    ? NETWORKS[cryptoType as keyof typeof NETWORKS]
    : [];

  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network);
    form.setValue("network", network);
    // Here you would typically fetch the deposit address for the selected network
    form.setValue("walletAddress", walletAddress || "");
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress || "");
      toast({
        title: "Address copied",

        description: "Deposit address has been copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);



      await createTransaction({
        ...data,
        type: "CRYPTO_DEPOSIT",
        cryptoType: data.cryptoType as CryptoType,
        walletAddress: walletAddress || "",
        network: data.network,

      });

      form.reset();
      onClose();
      onSuccess?.();
      toast({
        title: "Success",
        description: "Deposit initiated successfully",
      });
    } catch (error) {
      console.error("Transaction creation failed:", error);  // Debug log
      toast({
        title: "Error",
        description: "Failed to initiate deposit",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">
              {CRYPTO_ICONS[cryptoType as keyof typeof CRYPTO_ICONS]}
            </span>
            Deposit {cryptoType}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="0.00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cryptoType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={field.value} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDT">USDT</SelectItem>

                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="network"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chain</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={handleNetworkChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select chain" />
                      </SelectTrigger>
                      <SelectContent>
                        {networks.map((network) => (
                          <SelectItem key={network} value={network}>
                            {network}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedNetwork && (
              <>
                <FormField
                  control={form.control}
                  name="walletAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
                            <span className="flex-1 text-sm">
                              {walletAddress}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={handleCopyAddress}
                              type="button"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Deposit address QR code</FormLabel>

                  <FormControl>
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <QRCodeSVG value={walletAddress || ""} size={200} />
                    </div>
                  </FormControl>
                </FormItem>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >

                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Deposit"
                  )}
                </Button>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
