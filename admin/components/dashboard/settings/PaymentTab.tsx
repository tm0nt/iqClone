"use client";

import { Ban, PlugZap } from "lucide-react";

export function PaymentTab() {
  return (
    <div className="space-y-6 py-4">
      <div className="rounded-3xl border border-border/60 bg-card/40 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <PlugZap className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold">
              Integrações de pagamento limpas
            </h3>
            <p className="text-sm text-muted-foreground">
              Os gateways e webhooks concretos foram removidos desta instalação.
              A estrutura da plataforma continua pronta para receber um novo
              provedor, mas neste momento não há nenhuma integração ativa.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-dashed border-border/60 bg-background/30 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-muted/40 p-3 text-muted-foreground">
            <Ban className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Estado atual</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>Nenhum gateway ativo para depósito.</li>
              <li>Nenhum gateway ativo para saque.</li>
              <li>Nenhum webhook de provedor habilitado.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
