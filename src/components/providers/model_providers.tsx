"use client";

import { useEffect, useState } from "react";
import { NewBankAccount } from "../models/new_bank_accoun";
import { TransactionModal } from "../models/transaction_modal";

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
    <NewBankAccount />
    <TransactionModal />
   </>
  )
};
