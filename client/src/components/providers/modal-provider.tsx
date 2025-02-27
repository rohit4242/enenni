"use client";

import { useEffect, useState } from "react";
import { NewWalletModal } from "../modals/new-wallet-modal";
import { NewBankAccountModal } from "../modals/new-bank-account-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <NewWalletModal />
      <NewBankAccountModal />

    </>
  );
};
