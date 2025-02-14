import { create } from "zustand";
import * as z from "zod";

export const fiatWithdrawalSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  bankAccountId: z.string().min(1, "Bank account is required"),
  currency: z.string().min(1, "Currency is required"),
  description: z.string().optional(),
});

interface FiatWithdrawalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  form: z.infer<typeof fiatWithdrawalSchema>;
  onSubmit: (data: z.infer<typeof fiatWithdrawalSchema>) => void;

}


export const useFiatWithdrawalModal = create<FiatWithdrawalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  form: {
    amount: "",
    bankAccountId: "",
    currency: "",
    description: "",
  },
  onSubmit: (data) => {
    console.log(data);
  },
})); 