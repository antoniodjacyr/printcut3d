import { PipelineBoard } from "@/components/dashboard/pipeline-board";

export default function DashboardPipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Pipeline de produção (Kanban)</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Impressão 3D e laser: colunas desde o pagamento Stripe confirmado até envio com rastreamento. Dados mock —
          depois cada cartão é um pedido real (webhook Stripe + estado na base).
        </p>
      </div>
      <PipelineBoard />
    </div>
  );
}
