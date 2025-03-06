"use client";
import React from "react";
import { BaseModal } from "./BaseModal";
import { FiatDepositForm } from "./forms/FiatDepositForm";
import { CurrencyType } from "@/lib/types/db";

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber?: string;
  iban?: string;
}

interface FiatDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyType;
  bankAccounts: BankAccount[];
  onSuccess?: () => void;
}

export function FiatDepositModal({ isOpen, onClose, currency, bankAccounts, onSuccess }: FiatDepositModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={`Deposit ${currency}`}>
      <FiatDepositForm currency={currency} bankAccounts={bankAccounts} onSuccess={onSuccess} onClose={onClose} />
    </BaseModal>
  );
} 