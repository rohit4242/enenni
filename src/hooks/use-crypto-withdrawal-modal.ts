import { create } from "zustand";
import * as z from "zod";

export const cryptoWithdrawalSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  destinationAddress: z.string().min(1, "Destination address is required"),
  cryptoType: z.string().min(1, "Crypto type is required"),
  network: z.string().min(1, "Network is required"),
  memo: z.string().optional(),
});

interface CryptoWithdrawalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  form: z.infer<typeof cryptoWithdrawalSchema>;
  onSubmit: (data: z.infer<typeof cryptoWithdrawalSchema>) => void;
}


export const useCryptoWithdrawalModal = create<CryptoWithdrawalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  form: {
    amount: "",
    destinationAddress: "",
    cryptoType: "",
    network: "",
    memo: "",
  },
  onSubmit: (data) => {
    console.log(data);
  },
})); 