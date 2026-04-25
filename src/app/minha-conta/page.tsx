"use client";

import { useEffect, useState } from "react";

type CustomerOrder = {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerDetails: string;
  paymentPreference: string;
  orderStatus: string;
  sellerMessage: string;
  statusUpdatedAt: string;
  estimatedSubtotalUsd: number;
  totalItems: number;
  items: Array<{ title: string; quantity: number; unitPriceUsd: number; notes: string }>;
};

type Profile = { email: string; name: string; phone: string; avatarUrl?: string };

const ORDER_STEPS = [
  { id: "received", label: "Recebido" },
  { id: "pricing", label: "Orçamento" },
  { id: "awaiting_payment", label: "Aguardando pagamento" },
  { id: "paid", label: "Pago" },
  { id: "in_production", label: "Em produção" },
  { id: "ready_to_ship", label: "Pronto envio" },
  { id: "shipped", label: "Enviado" },
  { id: "delivered", label: "Entregue" }
] as const;

function stepIndex(status: string) {
  const idx = ORDER_STEPS.findIndex((s) => s.id === status);
  return idx >= 0 ? idx : 0;
}

export default function MinhaContaPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/customer/orders", { cache: "no-store" });
        const data = (await response.json()) as {
          error?: string;
          profile?: Profile;
          orders?: CustomerOrder[];
        };
        if (!response.ok) throw new Error(data.error || "Falha ao carregar conta.");
        setProfile(data.profile ?? null);
        setOrders(data.orders ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar conta.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-white">Minha conta</h1>
        <p className="mt-1 text-sm text-zinc-400">Acompanhe seus pedidos e atualizações da loja em tempo real.</p>
      </header>

      {profile && (
        <div className="tech-card grid gap-3 rounded-2xl p-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-zinc-500">Foto</p>
            <div className="mt-1 flex items-center gap-3">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="h-12 w-12 rounded-full object-cover ring-1 ring-white/20" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-white/10 ring-1 ring-white/20" />
              )}
              <label className="cursor-pointer text-xs text-neon hover:underline">
                {uploadingPhoto ? "Enviando..." : "Atualizar foto"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingPhoto}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingPhoto(true);
                    setError(null);
                    try {
                      const fd = new FormData();
                      fd.set("avatar", file);
                      const response = await fetch("/api/customer/profile-photo", { method: "POST", body: fd });
                      const data = (await response.json()) as { error?: string; avatarUrl?: string };
                      if (!response.ok) throw new Error(data.error || "Erro ao atualizar foto.");
                      setProfile((prev) => (prev ? { ...prev, avatarUrl: data.avatarUrl || prev.avatarUrl } : prev));
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Erro ao atualizar foto.");
                    } finally {
                      setUploadingPhoto(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase text-zinc-500">Nome</p>
            <p className="text-sm text-zinc-100">{profile.name || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-zinc-500">E-mail</p>
            <p className="text-sm text-zinc-100">{profile.email || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-zinc-500">Telefone</p>
            <p className="text-sm text-zinc-100">{profile.phone || "-"}</p>
          </div>
        </div>
      )}

      <div className="tech-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white">Meus pedidos</h2>
        {loading && <p className="mt-4 text-sm text-zinc-400">Carregando pedidos…</p>}
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="mt-4 text-sm text-zinc-500">Você ainda não possui pedidos.</p>
        )}
        {!loading && !error && orders.length > 0 && (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-zinc-100">Pedido {order.id}</p>
                    <p className="text-xs text-zinc-500">
                      Criado em {new Date(order.createdAt).toLocaleString("pt-BR")} · {order.totalItems} item(ns)
                    </p>
                  </div>
                  <div className="text-right text-sm text-zinc-300">
                    <p className="text-neon">${order.estimatedSubtotalUsd.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500">{order.paymentPreference}</p>
                  </div>
                </div>
                <OrderTimeline status={order.orderStatus} />
                <p className="mt-3 rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-zinc-200">
                  {order.sellerMessage}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  Atualizado em {new Date(order.statusUpdatedAt).toLocaleString("pt-BR")}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  {order.items.map((item, idx) => (
                    <li key={`${order.id}-${idx}`} className="rounded-lg border border-white/10 p-2">
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function OrderTimeline({ status }: { status: string }) {
  const active = stepIndex(status);
  return (
    <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-3">
      <div className="grid grid-cols-8 gap-2">
        {ORDER_STEPS.map((step, idx) => (
          <div key={step.id} className="flex flex-col items-center gap-1">
            <span
              className={`h-3.5 w-3.5 rounded-full ring-2 ring-offset-2 ring-offset-black ${
                idx <= active ? "bg-neon ring-neon/70" : "bg-zinc-700 ring-zinc-600"
              }`}
            />
            <span className={`text-center text-[10px] leading-tight ${idx <= active ? "text-zinc-200" : "text-zinc-500"}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
