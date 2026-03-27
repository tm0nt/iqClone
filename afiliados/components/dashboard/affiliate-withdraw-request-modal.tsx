"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatUsd } from "@shared/platform/branding";

interface AffiliateWithdrawRequestModalProps {
  amount: string;
  availableBalance: number;
  document: string;
  fee: number;
  isOpen: boolean;
  isSubmitting: boolean;
  pixKey: string;
  pixKeyType: string;
  onAmountChange: (value: string) => void;
  onClose: () => void;
  onDocumentChange: (value: string) => void;
  onPixKeyChange: (value: string) => void;
  onPixKeyTypeChange: (value: string) => void;
  onSubmit: () => void;
}

export function AffiliateWithdrawRequestModal({
  amount,
  availableBalance,
  document,
  fee,
  isOpen,
  isSubmitting,
  pixKey,
  pixKeyType,
  onAmountChange,
  onClose,
  onDocumentChange,
  onPixKeyChange,
  onPixKeyTypeChange,
  onSubmit,
}: AffiliateWithdrawRequestModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Solicitar Pagamento</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="valorSaque">Valor do Saque</Label>
            <Input
              id="valorSaque"
              type="number"
              placeholder="$0.00"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              inputMode="decimal"
              className="appearance-none"
            />
          </div>

          <div>
            <Label htmlFor="cpfCnpj">CPF ou CNPJ do Titular</Label>
            <Input
              id="cpfCnpj"
              type="text"
              placeholder="CPF ou CNPJ"
              value={document}
              onChange={(event) => onDocumentChange(event.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="tipoChave">Tipo de Chave Pix</Label>
            <Select value={pixKeyType} onValueChange={onPixKeyTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de chave" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpf">CPF</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="telefone">Telefone</SelectItem>
                <SelectItem value="chaveAleatoria">Chave Aleatória</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {pixKeyType ? (
            <div>
              <Label htmlFor="chavePix">Chave Pix</Label>
              <Input
                id="chavePix"
                type="text"
                placeholder="Digite a chave Pix"
                value={pixKey}
                onChange={(event) => onPixKeyChange(event.target.value)}
              />
            </div>
          ) : null}

          <div className="flex justify-between gap-4 text-sm">
            <p>Saldo disponível: {formatUsd(availableBalance)}</p>
            <p>Taxa de saque: {formatUsd(fee)}</p>
          </div>
        </div>

        <div className="flex justify-between gap-4">
          <Button onClick={onClose} variant="outline" disabled={isSubmitting}>
            Fechar
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Solicitando..." : "Solicitar Pagamento"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
