"use client";

import { PipelineBoard } from "@/components/dashboard/pipeline-board";

import { useLocale } from "@/components/providers/locale-provider";

export default function DashboardPipelinePage() {
  const { locale } = useLocale();
  const copy =
    locale === "pt"
      ? {
          title: "Pipeline de produção (Kanban)",
          desc: "Aqui você acompanha o fluxo operacional dos pedidos: recebido, orçamento, pagamento, produção e envio."
        }
      : locale === "es"
        ? {
            title: "Pipeline de producción (Kanban)",
            desc: "Aquí gestionas el flujo operativo de pedidos: recibido, presupuesto, pago, producción y envío."
          }
        : {
            title: "Production pipeline (Kanban)",
            desc: "This view manages operational order flow: received, quoting, payment, production, and shipping."
          };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">{copy.title}</h2>
        <p className="mt-1 text-sm text-zinc-400">{copy.desc}</p>
      </div>
      <PipelineBoard />
    </div>
  );
}
