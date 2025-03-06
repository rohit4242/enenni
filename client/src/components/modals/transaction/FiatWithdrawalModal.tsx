"use client";
import React from "react";
import { BaseModal } from "./BaseModal";
import { FiatWithdrawalForm } from "./forms/FiatWithdrawalForm";
import { CurrencyType } from "@/lib/types/db";

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber?: string;
  iban?: string;
}

interface FiatWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyType;
  bankAccounts: BankAccount[];
  onSuccess?: () => void;
  currentBalance: number;
}

export function FiatWithdrawalModal({ isOpen, onClose, currency, bankAccounts, onSuccess, currentBalance }: FiatWithdrawalModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={`Withdraw ${currency}`}>
      <FiatWithdrawalForm currentBalance={currentBalance} currency={currency} bankAccounts={bankAccounts} onSuccess={onSuccess} onClose={onClose} />
    </BaseModal>
  );
} 