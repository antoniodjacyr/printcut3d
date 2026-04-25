"use client";

import { QuoteRequestsList } from "@/components/dashboard/quote-requests-list";

export default function DashboardOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Pedidos recebidos</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Todos os pedidos enviados pelo carrinho aparecem aqui para você atualizar status, prazo, valor final e forma
          de pagamento.
        </p>
      </div>
      <QuoteRequestsList />
    </div>
  );
}
