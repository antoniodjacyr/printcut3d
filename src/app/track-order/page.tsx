"use client";

import { FormEvent, useState } from "react";

type TrackResponse = {
  id: string;
  createdAt: string;
  status: string;
  sellerMessage: string;
  statusUpdatedAt: string;
  subtotalEstimatedUsd: number;
  items: Array<{ title: string; quantity: number; unitPriceUsd: number; notes: string }>;
};

const ORDER_STEPS = [
  { id: "received", label: "Recebido" },
  { id: "pricing", label: "Orçamento enviado" },
  { id: "awaiting_payment", label: "Aguardando pagamento" },
  { id: "paid", label: "Pago" },
  { id: "in_production", label: "Em produção" },
  { id: "ready_to_ship", label: "Pronto para envio" },
  { id: "shipped", label: "Enviado" },
  { id: "delivered", label: "Entregue" }
] as const;

function getStepIndex(status: string) {
  const index = ORDER_STEPS.findIndex((step) => step.id === status);
  return index >= 0 ? index : 0;
}

export default function TrackOrderPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<TrackResponse | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const requestId = (form.elements.namedItem("requestId") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    if (!requestId || !email) return;
    setLoading(true);
    setError(null);
    setRequest(null);
    try {
      const response = await fetch(
        `/api/quote-requests/track?requestId=${encodeURIComponent(requestId)}&email=${encodeURIComponent(email)}`,
        { cache: "no-store" }
      );
      const data = (await response.json()) as { error?: string; request?: TrackResponse };
      if (!response.ok || !data.request) throw new Error(data.error || "Não foi possível consultar.");
      setRequest(data.request);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro na consulta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-white">Acompanhar pedido</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Informe o código do pedido e seu e-mail para ver o andamento atualizado pela equipe.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="tech-card grid gap-3 rounded-2xl p-6 md:grid-cols-[1fr_1fr_auto]">
        <input
          name="requestId"
          placeholder="Código do pedido (requestId)"
          required
          className="rounded-md border border-white/15 bg-black/30 p-2"
        />
        <input
          name="email"
          type="email"
          placeholder="E-mail usado no pedido"
          required
          className="rounded-md border border-white/15 bg-black/30 p-2"
        />
        <button type="submit" disabled={loading} className="rounded-md bg-neon px-4 py-2 font-semibold text-black">
          {loading ? "Consultando..." : "Consultar"}
        </button>
      </form>

      {error && <p className="text-sm text-red-300">{error}</p>}
      {request && (
        <article className="tech-card space-y-4 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-zinc-100">Pedido {request.id}</p>
            <p className="text-sm text-neon">Status: {request.status}</p>
          </div>
          <p className="text-xs text-zinc-400">
            Última atualização: {new Date(request.statusUpdatedAt).toLocaleString("pt-BR")} | Criado em{" "}
            {new Date(request.createdAt).toLocaleString("pt-BR")}
          </p>
          <StatusTimeline status={request.status} />
          <p className="rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-zinc-200">{request.sellerMessage}</p>
          <p className="text-sm text-zinc-300">Subtotal estimado: ${request.subtotalEstimatedUsd.toFixed(2)}</p>
          <ul className="space-y-2 text-sm text-zinc-300">
            {request.items.map((item, idx) => (
              <li key={`${request.id}-${idx}`} className="rounded-lg border border-white/10 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span>{item.title}</span>
                  <span className="text-zinc-400">
                    {item.quantity} × ${item.unitPriceUsd.toFixed(2)}
                  </span>
                </div>
                {item.notes && <p className="mt-1 text-xs text-zinc-500">{item.notes}</p>}
              </li>
            ))}
          </ul>
        </article>
      )}
    </section>
  );
}

function StatusTimeline({ status }: { status: string }) {
  const activeIndex = getStepIndex(status);
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="mb-3 text-xs text-zinc-400">Andamento do pedido</p>
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="mb-2 grid grid-cols-8 gap-2">
            {ORDER_STEPS.map((step, idx) => {
              const done = idx <= activeIndex;
              return (
                <div key={step.id} className="flex items-center justify-center">
                  <span
                    className={`h-3.5 w-3.5 rounded-full ring-2 ring-offset-2 ring-offset-black ${
                      done ? "bg-neon ring-neon/70" : "bg-zinc-700 ring-zinc-600"
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-8 gap-2">
            {ORDER_STEPS.map((step, idx) => (
              <p
                key={step.id}
                className={`text-center text-[11px] leading-tight ${
                  idx <= activeIndex ? "text-zinc-200" : "text-zinc-500"
                }`}
              >
                {step.label}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
