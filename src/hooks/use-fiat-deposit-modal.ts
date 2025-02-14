import { create } from "zustand";
import * as z from "zod";

export const fiatDepositSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  bankAccountId: z.string().min(1, "Bank account is required"),
  currency: z.string().min(1, "Currency is required"),
});

interface FiatDepositStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  form: z.infer<typeof fiatDepositSchema>;
  onSubmit: (data: z.infer<typeof fiatDepositSchema>) => void;  
}

export const useFiatDepositModal = create<FiatDepositStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  form: {
    amount: "",
    bankAccountId: "",
    currency: "",
  },
  onSubmit: (data) => {
    console.log(data);
  },
}));