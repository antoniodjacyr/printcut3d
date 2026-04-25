"use client";

import { useEffect, useState } from "react";

type CustomerOrder = {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerDetails: string;
  paymentPreference: string;
  paymentStatus: string;
  orderStatus: string;
  sellerMessage: string;
  statusUpdatedAt: string;
  estimatedSubtotalUsd: number;
  totalItems: number;
  items: Array<{ title: string; quantity: number; unitPriceUsd: number; notes: string }>;
};

type Profile = {
  email: string;
  name: string;
  phone: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  avatarUrl?: string;
};

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
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    country: "USA"
  });
  const [locationLocked, setLocationLocked] = useState(false);
  const [zipLookupLoading, setZipLookupLoading] = useState(false);
  const [zipLookupMessage, setZipLookupMessage] = useState<string | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
        setForm({
          name: data.profile?.name || "",
          phone: data.profile?.phone || "",
          addressLine1: data.profile?.addressLine1 || "",
          addressLine2: data.profile?.addressLine2 || "",
          city: data.profile?.city || "",
          state: data.profile?.state || "",
          zip: data.profile?.zip || "",
          country: data.profile?.country || "USA"
        });
        setLocationLocked(Boolean(data.profile?.city && data.profile?.state));
        setOrders(data.orders ?? []);
        setSelectedOrderId((data.orders ?? [])[0]?.id ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar conta.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Erro ao salvar perfil.");
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: form.name,
              phone: form.phone,
              addressLine1: form.addressLine1,
              addressLine2: form.addressLine2,
              city: form.city,
              state: form.state,
              zip: form.zip,
              country: form.country
            }
          : prev
      );
      setSuccess("Dados atualizados com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadAvatar = async (file: File | null) => {
    if (!file) return;
    setSavingAvatar(true);
    setError(null);
    setSuccess(null);
    try {
      const fd = new FormData();
      fd.set("avatar", file);
      const response = await fetch("/api/customer/profile/avatar", { method: "POST", body: fd });
      const data = (await response.json()) as { error?: string; avatarUrl?: string };
      if (!response.ok) throw new Error(data.error || "Erro ao atualizar foto.");
      setProfile((prev) => (prev ? { ...prev, avatarUrl: data.avatarUrl || prev.avatarUrl } : prev));
      setSuccess("Foto de perfil atualizada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar foto.");
    } finally {
      setSavingAvatar(false);
    }
  };

  const resolveCountryCode = (country: string) => {
    const value = country.trim().toLowerCase();
    if (!value) return "us";
    if (value === "usa" || value === "us" || value.includes("united states") || value.includes("estados unidos")) {
      return "us";
    }
    if (value === "canada" || value === "ca") return "ca";
    if (value === "mexico" || value === "mx" || value === "méxico") return "mx";
    if (value === "brazil" || value === "brasil" || value === "br") return "br";
    return value.slice(0, 2);
  };

  const fillCityStateByZip = async (zip: string, country: string) => {
    const cleanZip = zip.trim();
    if (!cleanZip) return;
    setZipLookupLoading(true);
    setZipLookupMessage(null);
    setLocationLocked(false);
    try {
      const countryCode = resolveCountryCode(country);
      const response = await fetch(
        `https://api.zippopotam.us/${countryCode}/${encodeURIComponent(cleanZip)}`
      );
      if (!response.ok) {
        setZipLookupMessage("Nao foi possivel localizar cidade/estado com esse ZIP.");
        return;
      }
      const data = (await response.json()) as {
        places?: Array<{ "place name"?: string; state?: string; "state abbreviation"?: string }>;
      };
      const first = data.places?.[0];
      if (!first) {
        setZipLookupMessage("Nao foi possivel localizar cidade/estado com esse ZIP.");
        return;
      }
      const nextCity = first["place name"]?.trim() || "";
      const nextState = first["state abbreviation"]?.trim() || first.state?.trim() || "";
      setForm((prev) => ({ ...prev, city: nextCity, state: nextState }));
      if (nextCity && nextState) {
        setLocationLocked(true);
        setZipLookupMessage("Cidade e estado preenchidos automaticamente e bloqueados.");
      }
    } catch {
      setZipLookupMessage("Nao foi possivel consultar o ZIP neste momento.");
    } finally {
      setZipLookupLoading(false);
    }
  };

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || null;
  const paymentStatusLabel = (status: string) =>
    ({
      pending: "Pendente",
      processing: "Processando",
      paid: "Pago",
      refunded: "Reembolsado"
    })[status] || status;

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-white">Minha conta</h1>
        <p className="mt-1 text-sm text-zinc-400">Acompanhe seus pedidos e atualizações da loja em tempo real.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`rounded-md px-4 py-2 text-sm ${activeTab === "profile" ? "bg-neon text-black" : "border border-white/15 text-zinc-200"}`}
        >
          Perfil
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`rounded-md px-4 py-2 text-sm ${activeTab === "orders" ? "bg-neon text-black" : "border border-white/15 text-zinc-200"}`}
        >
          Meus pedidos
        </button>
      </div>

      {activeTab === "profile" && profile && (
        <div className="tech-card grid gap-4 rounded-2xl p-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-zinc-500">Foto</p>
            <div className="mt-1 flex items-center gap-3">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="h-12 w-12 rounded-full object-cover ring-1 ring-white/20" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-white/10 ring-1 ring-white/20" />
              )}
              <label className="text-xs text-neon hover:underline">
                {savingAvatar ? "Enviando..." : "Alterar foto"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={savingAvatar}
                  onChange={(e) => void uploadAvatar(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase text-zinc-500">Nome</p>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 w-full rounded-md border border-white/15 bg-black/30 p-2 text-sm text-zinc-100"
            />
          </div>
          <div>
            <p className="text-xs uppercase text-zinc-500">E-mail</p>
            <p className="text-sm text-zinc-100">{profile.email || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-zinc-500">Telefone</p>
            <input
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="mt-1 w-full rounded-md border border-white/15 bg-black/30 p-2 text-sm text-zinc-100"
            />
          </div>
          <div className="md:col-span-2">
            <p className="text-xs uppercase text-zinc-500">Endereço</p>
            <input
              value={form.addressLine1}
              onChange={(e) => setForm((prev) => ({ ...prev, addressLine1: e.target.value }))}
              placeholder="Endereço"
              className="mt-1 w-full rounded-md border border-white/15 bg-black/30 p-2 text-sm text-zinc-100"
            />
            <input
              value={form.addressLine2}
              onChange={(e) => setForm((prev) => ({ ...prev, addressLine2: e.target.value }))}
              placeholder="Complemento"
              className="mt-2 w-full rounded-md border border-white/15 bg-black/30 p-2 text-sm text-zinc-100"
            />
            <div className="mt-2 grid gap-2 sm:grid-cols-4">
              <input
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Cidade"
                readOnly={locationLocked}
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm text-zinc-100"
              />
              <input
                value={form.state}
                onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                placeholder="Estado"
                readOnly={locationLocked}
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm text-zinc-100"
              />
              <input
                value={form.zip}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, zip: e.target.value }));
                  setLocationLocked(false);
                }}
                onBlur={(e) => void fillCityStateByZip(e.target.value, form.country)}
                placeholder="ZIP"
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm text-zinc-100"
              />
              <input
                value={form.country}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, country: e.target.value }));
                  setLocationLocked(false);
                }}
                placeholder="País"
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm text-zinc-100"
              />
            </div>
            {(zipLookupLoading || zipLookupMessage) && (
              <p className="mt-2 text-xs text-zinc-500">
                {zipLookupLoading ? "Buscando cidade e estado..." : zipLookupMessage}
              </p>
            )}
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="button"
              onClick={() => void saveProfile()}
              disabled={savingProfile}
              className="rounded-md bg-neon px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
            >
              {savingProfile ? "Salvando..." : "Salvar perfil"}
            </button>
          </div>
        </div>
      )}
      {success && <p className="text-sm text-emerald-300">{success}</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}

      {activeTab === "orders" && (
        <div className="tech-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white">Meus pedidos</h2>
          {loading && <p className="mt-4 text-sm text-zinc-400">Carregando pedidos…</p>}
          {!loading && !error && orders.length === 0 && (
            <p className="mt-4 text-sm text-zinc-500">Você ainda não possui pedidos.</p>
          )}
          {!loading && !error && orders.length > 0 && (
            <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <aside className="space-y-2">
                {orders.map((order) => {
                  const selected = selectedOrderId === order.id;
                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`w-full rounded-lg border p-3 text-left transition ${
                        selected ? "border-neon/50 bg-neon/10" : "border-white/10 bg-black/25 hover:border-white/30"
                      }`}
                    >
                      <p className="font-medium text-zinc-100">Pedido {order.id.slice(0, 8)}...</p>
                      <p className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
                      <p className="mt-1 text-xs text-zinc-300">
                        {order.totalItems} item(ns) · ${order.estimatedSubtotalUsd.toFixed(2)}
                      </p>
                      <p className="text-xs text-emerald-300">
                        {order.orderStatus} · pagamento: {paymentStatusLabel(order.paymentStatus)}
                      </p>
                    </button>
                  );
                })}
              </aside>

              {selectedOrder && (
                <article className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-100">Pedido {selectedOrder.id}</p>
                      <p className="text-xs text-zinc-500">
                        Criado em {new Date(selectedOrder.createdAt).toLocaleString("pt-BR")} · {selectedOrder.totalItems} item(ns)
                      </p>
                    </div>
                    <div className="text-right text-sm text-zinc-300">
                      <p className="text-neon">${selectedOrder.estimatedSubtotalUsd.toFixed(2)}</p>
                      <p className="text-xs text-zinc-400">Forma: {selectedOrder.paymentPreference}</p>
                      <p className="text-xs text-emerald-300">Status pagamento: {paymentStatusLabel(selectedOrder.paymentStatus)}</p>
                    </div>
                  </div>
                  <OrderTimeline status={selectedOrder.orderStatus} />
                  <p className="mt-3 rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-zinc-200">
                    {selectedOrder.sellerMessage}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Atualizado em {new Date(selectedOrder.statusUpdatedAt).toLocaleString("pt-BR")}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    {selectedOrder.items.map((item, idx) => (
                      <li key={`${selectedOrder.id}-${idx}`} className="rounded-lg border border-white/10 p-2">
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
            </div>
          )}
        </div>
      )}
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
