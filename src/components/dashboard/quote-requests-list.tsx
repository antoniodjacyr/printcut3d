"use client";

import { useEffect, useState } from "react";

type RequestRow = {
  id: string;
  email: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerDetails: string;
  paymentPreference: string;
  orderStatus: string;
  sellerMessage: string;
  statusUpdatedAt: string;
  totalItems: number;
  estimatedSubtotalUsd: number;
  items: Array<{ title: string; quantity: number; unitPriceUsd: number; notes: string }>;
};

export function QuoteRequestsList({ refreshToken }: { refreshToken?: number }) {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/dashboard/quote-requests", { cache: "no-store" });
        const data = (await response.json()) as { error?: string; requests?: RequestRow[] };
        if (!response.ok) throw new Error(data.error || "Falha ao carregar pedidos.");
        setRows(data.requests ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar pedidos.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [refreshToken]);

  const saveStatus = async (row: RequestRow, orderStatus: string, sellerMessage: string) => {
    setPendingId(row.id);
    setError(null);
    try {
      const response = await fetch("/api/dashboard/quote-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: row.id, orderStatus, sellerMessage })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Falha ao atualizar status.");
      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? {
                ...item,
                orderStatus,
                sellerMessage,
                statusUpdatedAt: new Date().toISOString()
              }
            : item
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar status.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section className="tech-card rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white">Pedidos recebidos (carrinho)</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Cliente adiciona ao carrinho, envia as informações, e você responde com o valor total + forma de pagamento.
      </p>

      {loading && <p className="mt-4 text-sm text-zinc-400">Carregando pedidos…</p>}
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="mt-4 text-sm text-zinc-500">Sem pedidos por enquanto.</p>}

      {!loading && !error && rows.length > 0 && (
        <div className="mt-4 space-y-4">
          {rows.map((row) => (
            <article key={row.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-100">{row.customerName || "Cliente"}</p>
                  <p className="text-xs text-zinc-400">{row.email}</p>
                  {row.customerPhone && <p className="text-xs text-zinc-500">Tel/WhatsApp: {row.customerPhone}</p>}
                  <p className="mt-1 text-xs text-emerald-300">
                    Status: <span className="font-semibold">{row.orderStatus}</span>
                  </p>
                </div>
                <div className="text-right text-xs text-zinc-400">
                  <p>{new Date(row.createdAt).toLocaleString("pt-BR")}</p>
                  <p className="text-neon">Subtotal est.: ${row.estimatedSubtotalUsd.toFixed(2)}</p>
                  <p>Pagamento: {row.paymentPreference}</p>
                  <p>Atualizado: {new Date(row.statusUpdatedAt).toLocaleString("pt-BR")}</p>
                </div>
              </div>
              {row.customerDetails && (
                <p className="mt-3 rounded-lg border border-white/10 bg-black/30 p-2 text-xs text-zinc-300">
                  {row.customerDetails}
                </p>
              )}
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                {row.items.map((item, idx) => (
                  <li key={`${row.id}-${idx}`} className="rounded-lg border border-white/10 p-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span>{item.title}</span>
                      <span className="text-zinc-400">
                        {item.quantity} × ${item.unitPriceUsd.toFixed(2)}
                      </span>
                    </div>
                    {item.notes && <p className="mt-1 text-xs text-zinc-500">Detalhes: {item.notes}</p>}
                  </li>
                ))}
              </ul>
              <StatusEditor row={row} pending={pendingId === row.id} onSave={saveStatus} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusEditor({
  row,
  pending,
  onSave
}: {
  row: RequestRow;
  pending: boolean;
  onSave: (row: RequestRow, orderStatus: string, sellerMessage: string) => Promise<void>;
}) {
  const [status, setStatus] = useState(row.orderStatus);
  const [message, setMessage] = useState(row.sellerMessage || "");

  return (
    <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3">
      <p className="text-xs text-zinc-400">Atualizar andamento para o cliente</p>
      <div className="mt-2 grid gap-2 md:grid-cols-[180px_1fr_auto]">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-white/15 bg-black/40 p-2 text-sm text-zinc-200"
        >
          <option value="received">Recebido</option>
          <option value="pricing">Orçamento enviado</option>
          <option value="awaiting_payment">Aguardando pagamento</option>
          <option value="paid">Pago</option>
          <option value="in_production">Em produção</option>
          <option value="ready_to_ship">Pronto para envio</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregue</option>
        </select>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mensagem para o cliente..."
          className="rounded-md border border-white/15 bg-black/40 p-2 text-sm text-zinc-200"
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => void onSave(row, status, message)}
          className="rounded-md bg-neon px-3 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
