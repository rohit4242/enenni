import { create } from 'zustand';

interface UseNewWalletModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useNewWalletModal = create<UseNewWalletModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
})); 