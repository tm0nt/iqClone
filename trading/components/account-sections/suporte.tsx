import { useState } from "react";
import { AccountInlineSelect } from "@/components/account-inline-select";

export default function SuporteSection() {
  const [subject, setSubject] = useState("");

  return (
    <div className="w-full text-white space-y-6">
      {/* Ticket form */}
      <div className="bg-white/[0.03] rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6">Suporte</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/50 mb-2">Assunto</label>
            <AccountInlineSelect
              value={subject}
              onChange={setSubject}
              placeholder="Selecione um assunto"
              options={[
                { id: "deposit", label: "Depósito" },
                { id: "withdraw", label: "Saque" },
                { id: "account", label: "Conta" },
                { id: "trading", label: "Trading" },
                { id: "other", label: "Outro" },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm text-white/50 mb-2">Mensagem</label>
            <textarea
              className="w-full bg-white/5 text-white rounded-xl py-3 px-4 min-h-[120px] focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200 resize-none placeholder-white/20"
              placeholder="Descreva seu problema ou dúvida em detalhes"
            />
          </div>

          <div>
            <label className="block text-sm text-white/50 mb-2">Anexar arquivo (opcional)</label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-5 text-center hover:border-white/20 hover:bg-white/5 transition-all duration-200 cursor-pointer">
              <div className="text-sm text-white/30 mb-1">Arraste e solte arquivos aqui ou</div>
              <span className="text-sm text-white/60 hover:text-white transition-colors">clique para selecionar</span>
            </div>
          </div>

          <button className="w-full bg-white text-black py-3 rounded-xl font-medium hover:bg-white/90 transition-all duration-200">
            Enviar ticket
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white/[0.03] rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6">Perguntas frequentes</h3>

        <div className="space-y-5">
          {[
            {
              q: "Como faço um depósito?",
              a: 'Para fazer um depósito, acesse a seção "Depositar" em sua conta e siga as instruções para o método de pagamento escolhido.',
            },
            {
              q: "Quanto tempo leva para processar um saque?",
              a: "Os saques via Pix são processados instantaneamente. Outros métodos podem levar de 1 a 3 dias úteis.",
            },
            {
              q: "Como altero minhas informações pessoais?",
              a: 'Você pode atualizar suas informações pessoais na seção "Visão geral" da sua conta.',
            },
          ].map((item, i) => (
            <div key={i} className={i < 2 ? "border-b border-white/[0.06] pb-5" : ""}>
              <div className="text-sm font-medium text-white mb-2">{item.q}</div>
              <div className="text-sm text-white/40 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
