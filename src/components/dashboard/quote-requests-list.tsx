"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";

type RequestRow = {
  id: string;
  email: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerDetails: string;
  paymentPreference: string;
  paymentStatus: string;
  orderStatus: string;
  sellerMessage: string;
  statusUpdatedAt: string;
  totalItems: number;
  estimatedSubtotalUsd: number;
  items: Array<{ title: string; quantity: number; unitPriceUsd: number; notes: string }>;
};

export function QuoteRequestsList({ refreshToken }: { refreshToken?: number }) {
  const { locale } = useLocale();
  const copy = useMemo(
    () =>
      locale === "pt"
        ? {
            title: "Pedidos recebidos (carrinho)",
            subtitle:
              "Cliente adiciona ao carrinho, envia as informações, e você responde com o valor total + forma de pagamento.",
            loading: "Carregando pedidos...",
            empty: "Sem pedidos por enquanto.",
            customer: "Cliente",
            phone: "Tel/WhatsApp",
            status: "Status",
            subtotal: "Subtotal est.",
            payment: "Pagamento",
            paymentStatus: "Status",
            updatedAt: "Atualizado",
            details: "Detalhes",
            editorTitle: "Atualização automática para o cliente",
            save: "Salvar",
            saving: "Salvando...",
            messageLabel: "Mensagem automática",
            statusLabels: {
              received: "Recebido",
              pricing: "Orçamento enviado",
              awaiting_payment: "Aguardando pagamento",
              paid: "Pago",
              in_production: "Em produção",
              ready_to_ship: "Pronto para envio",
              shipped: "Enviado",
              delivered: "Entregue"
            } as Record<string, string>,
            paymentLabels: {
              pending: "Pagamento pendente",
              processing: "Processando pagamento",
              paid: "Pagamento confirmado",
              refunded: "Pagamento reembolsado"
            } as Record<string, string>
          }
        : locale === "es"
          ? {
              title: "Pedidos recibidos (carrito)",
              subtitle:
                "El cliente agrega al carrito, envía la información y tú respondes con valor final + forma de pago.",
              loading: "Cargando pedidos...",
              empty: "Sin pedidos por ahora.",
              customer: "Cliente",
              phone: "Tel/WhatsApp",
              status: "Estado",
              subtotal: "Subtotal est.",
              payment: "Pago",
              paymentStatus: "Estado",
              updatedAt: "Actualizado",
              details: "Detalles",
              editorTitle: "Actualización automática para el cliente",
              save: "Guardar",
              saving: "Guardando...",
              messageLabel: "Mensaje automático",
              statusLabels: {
                received: "Recibido",
                pricing: "Presupuesto enviado",
                awaiting_payment: "Esperando pago",
                paid: "Pagado",
                in_production: "En producción",
                ready_to_ship: "Listo para envío",
                shipped: "Enviado",
                delivered: "Entregado"
              } as Record<string, string>,
              paymentLabels: {
                pending: "Pago pendiente",
                processing: "Procesando pago",
                paid: "Pago confirmado",
                refunded: "Pago reembolsado"
              } as Record<string, string>
            }
          : {
              title: "Received orders (cart)",
              subtitle:
                "Customer adds to cart, submits details, and you reply with final amount + payment method.",
              loading: "Loading orders...",
              empty: "No orders yet.",
              customer: "Customer",
              phone: "Phone/WhatsApp",
              status: "Status",
              subtotal: "Estimated subtotal",
              payment: "Payment",
              paymentStatus: "Status",
              updatedAt: "Updated",
              details: "Details",
              editorTitle: "Automatic customer update",
              save: "Save",
              saving: "Saving...",
              messageLabel: "Automatic message",
              statusLabels: {
                received: "Received",
                pricing: "Quote sent",
                awaiting_payment: "Awaiting payment",
                paid: "Paid",
                in_production: "In production",
                ready_to_ship: "Ready to ship",
                shipped: "Shipped",
                delivered: "Delivered"
              } as Record<string, string>,
              paymentLabels: {
                pending: "Payment pending",
                processing: "Payment processing",
                paid: "Payment confirmed",
                refunded: "Payment refunded"
              } as Record<string, string>
            },
    [locale]
  );
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

  const saveStatus = async (row: RequestRow, orderStatus: string, paymentStatus: string, sellerMessage: string) => {
    setPendingId(row.id);
    setError(null);
    try {
      const response = await fetch("/api/dashboard/quote-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: row.id, orderStatus, paymentStatus, sellerMessage })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Falha ao atualizar status.");
      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? {
                ...item,
                orderStatus,
                paymentStatus,
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
      <h3 className="text-lg font-semibold text-white">{copy.title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{copy.subtitle}</p>

      {loading && <p className="mt-4 text-sm text-zinc-400">{copy.loading}</p>}
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="mt-4 text-sm text-zinc-500">{copy.empty}</p>}

      {!loading && !error && rows.length > 0 && (
        <div className="mt-4 space-y-4">
          {rows.map((row) => (
            <article key={row.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-100">{row.customerName || copy.customer}</p>
                  <p className="text-xs text-zinc-400">{row.email}</p>
                  {row.customerPhone && <p className="text-xs text-zinc-500">{copy.phone}: {row.customerPhone}</p>}
                  <p className="mt-1 text-xs text-emerald-300">
                    {copy.status}: <span className="font-semibold">{copy.statusLabels[row.orderStatus] || row.orderStatus}</span>
                  </p>
                </div>
                <div className="text-right text-xs text-zinc-400">
                  <p>{new Date(row.createdAt).toLocaleString("pt-BR")}</p>
                  <p className="text-neon">{copy.subtotal}: ${row.estimatedSubtotalUsd.toFixed(2)}</p>
                  <p>
                    {copy.payment}: {row.paymentPreference} · {copy.paymentStatus}:{" "}
                    <span className={row.paymentStatus === "paid" ? "text-emerald-300" : "text-amber-300"}>
                      {copy.paymentLabels[row.paymentStatus] || row.paymentStatus}
                    </span>
                  </p>
                  <p>{copy.updatedAt}: {new Date(row.statusUpdatedAt).toLocaleString("pt-BR")}</p>
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
                    {item.notes && <p className="mt-1 text-xs text-zinc-500">{copy.details}: {item.notes}</p>}
                  </li>
                ))}
              </ul>
              <StatusEditor row={row} pending={pendingId === row.id} onSave={saveStatus} copy={copy} />
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
  onSave,
  copy
}: {
  row: RequestRow;
  pending: boolean;
  onSave: (row: RequestRow, orderStatus: string, paymentStatus: string, sellerMessage: string) => Promise<void>;
  copy: {
    editorTitle: string;
    save: string;
    saving: string;
    messageLabel: string;
    statusLabels: Record<string, string>;
    paymentLabels: Record<string, string>;
  };
}) {
  const buildAutoMessage = (orderStatus: string, paymentStatus: string) => {
    const statusLabel = copy.statusLabels[orderStatus] || orderStatus;
    const paymentLabel = copy.paymentLabels[paymentStatus] || paymentStatus;
    return `${statusLabel}. ${paymentLabel}.`;
  };
  const [status, setStatus] = useState(row.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState(row.paymentStatus || "pending");
  const [message, setMessage] = useState(row.sellerMessage || buildAutoMessage(row.orderStatus, row.paymentStatus));

  useEffect(() => {
    setMessage(buildAutoMessage(status, paymentStatus));
  }, [status, paymentStatus]);

  return (
    <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3">
      <p className="text-xs text-zinc-400">{copy.editorTitle}</p>
      <div className="mt-2 grid gap-2 md:grid-cols-[180px_160px_1fr_auto]">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-white/15 bg-black/40 p-2 text-sm text-zinc-200"
        >
          <option value="received">{copy.statusLabels.received}</option>
          <option value="pricing">{copy.statusLabels.pricing}</option>
          <option value="awaiting_payment">{copy.statusLabels.awaiting_payment}</option>
          <option value="paid">{copy.statusLabels.paid}</option>
          <option value="in_production">{copy.statusLabels.in_production}</option>
          <option value="ready_to_ship">{copy.statusLabels.ready_to_ship}</option>
          <option value="shipped">{copy.statusLabels.shipped}</option>
          <option value="delivered">{copy.statusLabels.delivered}</option>
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="rounded-md border border-white/15 bg-black/40 p-2 text-sm text-zinc-200"
        >
          <option value="pending">{copy.paymentLabels.pending}</option>
          <option value="processing">{copy.paymentLabels.processing}</option>
          <option value="paid">{copy.paymentLabels.paid}</option>
          <option value="refunded">{copy.paymentLabels.refunded}</option>
        </select>
        <input
          value={message}
          readOnly
          aria-label={copy.messageLabel}
          className="rounded-md border border-white/15 bg-black/40 p-2 text-sm text-zinc-200"
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => void onSave(row, status, paymentStatus, message)}
          className="rounded-md bg-neon px-3 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          {pending ? copy.saving : copy.save}
        </button>
      </div>
    </div>
  );
}
