"use client";
import React from "react";
import { BaseModal } from "./BaseModal";
import { CryptoWithdrawalForm } from "./forms/CryptoWithdrawalForm";
import { CryptoType } from "@/lib/types/db";

interface CryptoWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  cryptoType: CryptoType;
  networks: string[];
  onSuccess?: () => void;
  currentBalance: number;
}

export function CryptoWithdrawalModal({ isOpen, onClose, cryptoType, networks, onSuccess, currentBalance }: CryptoWithdrawalModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={`Withdraw ${cryptoType}`}>
      <CryptoWithdrawalForm currentBalance={currentBalance} cryptoType={cryptoType} networks={networks} onSuccess={onSuccess} onClose={onClose} />
    </BaseModal>
  );
} 