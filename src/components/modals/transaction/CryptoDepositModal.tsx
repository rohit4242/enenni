"use client";
import React from "react";
import { BaseModal } from "@/components/modals/transaction/BaseModal";
import { CryptoDepositForm } from "@/components/modals/transaction/forms/CryptoDepositForm";
import { CryptoType } from "@prisma/client";

interface CryptoDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  cryptoType: CryptoType;
  networks: string[];
  onSuccess?: () => void;
}

export function CryptoDepositModal({ isOpen, onClose, cryptoType, networks, onSuccess }: CryptoDepositModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={`Deposit ${cryptoType}`}>
      <CryptoDepositForm cryptoType={cryptoType} networks={networks} onSuccess={onSuccess} onClose={onClose} />
    </BaseModal>
  );
} 