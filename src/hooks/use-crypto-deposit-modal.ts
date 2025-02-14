import { create } from "zustand";
import * as z from "zod";

export const cryptoDepositSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  walletAddress: z.string().min(1, "Wallet address is required"),
  cryptoType: z.string().min(1, "Crypto type is required"),
  network: z.string().min(1, "Network is required"),
});

interface CryptoDepositStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  form: z.infer<typeof cryptoDepositSchema>;
  onSubmit: (data: z.infer<typeof cryptoDepositSchema>) => void;
}


export const useCryptoDepositModal = create<CryptoDepositStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  form: {
    amount: "",
    walletAddress: "",
    cryptoType: "",
    network: "",
  },
  onSubmit: (data) => {
    console.log(data);
  },
})); 