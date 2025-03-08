"use client";
import React from "react";
import { BaseModal } from "./BaseModal";
import { CryptoDepositForm } from "./forms/CryptoDepositForm";
import { CryptoType } from "@/lib/types/db";

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