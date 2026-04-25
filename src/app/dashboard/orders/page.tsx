"use client";

import { QuoteRequestsList } from "@/components/dashboard/quote-requests-list";
import { useLocale } from "@/components/providers/locale-provider";

export default function DashboardOrdersPage() {
  const { locale } = useLocale();
  const copy =
    locale === "pt"
      ? {
          title: "Pedidos recebidos",
          subtitle:
            "Todos os pedidos enviados pelo carrinho aparecem aqui para você atualizar status, prazo, valor final e forma de pagamento."
        }
      : locale === "es"
        ? {
            title: "Pedidos recibidos",
            subtitle:
              "Todos los pedidos enviados desde el carrito aparecen aquí para actualizar estado, plazo, valor final y forma de pago."
          }
        : {
            title: "Received orders",
            subtitle:
              "All cart-submitted orders appear here so you can update status, deadline, final amount, and payment flow."
          };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">{copy.title}</h2>
        <p className="mt-1 text-sm text-zinc-400">{copy.subtitle}</p>
      </div>
      <QuoteRequestsList />
    </div>
  );
}
