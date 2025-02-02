import { create } from 'zustand'

type TransactionType = 'deposit' | 'withdraw'

interface TransactionModalStore {
  isOpen: boolean
  type: TransactionType | null
  onOpen: (type: TransactionType) => void
  onClose: () => void
}

export const useTransactionModal = create<TransactionModalStore>((set) => ({
  isOpen: false,
  type: null,
  onOpen: (type) => set({ isOpen: true, type }),
  onClose: () => set({ isOpen: false, type: null }),
})) 