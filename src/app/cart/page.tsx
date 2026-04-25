"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/providers/cart-provider";

export default function CartPage() {
  const { items, updateQty, removeItem, updateCustomization, clear } = useCart();
  const [state, setState] = useState<{ loading: boolean; error: string | null; success: string | null }>({
    loading: false,
    error: null,
    success: null
  });

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.priceUsd * item.quantity, 0), [items]);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [shippingEstimate, setShippingEstimate] = useState<number | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/customer/profile", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as {
          profile?: {
            name?: string;
            email?: string;
            phone?: string;
            addressLine1?: string;
            addressLine2?: string;
            city?: string;
            state?: string;
            zip?: string;
            country?: string;
          };
        };
        const p = data.profile;
        if (!p) return;
        const setValue = (name: string, value: string | undefined) => {
          const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`);
          if (input && !input.value) {
            input.value = value || "";
          }
        };
        setValue("name", p.name);
        setValue("email", p.email);
        setValue("phone", p.phone);
        setValue("addressLine1", p.addressLine1);
        setValue("addressLine2", p.addressLine2);
        setValue("city", p.city);
        setValue("state", p.state);
        setValue("zip", p.zip);
        setValue("country", p.country);
      } catch {
        /* ignore */
      } finally {
        setProfileLoaded(true);
      }
    };
    void loadProfile();
  }, []);

  const estimateShipping = (zip: string, itemCount: number) => {
    const firstDigit = Number((zip || "").trim()[0] || "0");
    const zoneExtra = Number.isFinite(firstDigit) ? Math.min(9, Math.max(0, firstDigit)) * 0.85 : 0;
    const qtyExtra = Math.max(0, itemCount - 1) * 1.25;
    return Number((6.5 + zoneExtra + qtyExtra).toFixed(2));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (items.length === 0) {
      setState({ loading: false, error: "Seu carrinho está vazio.", success: null });
      return;
    }
    const form = event.currentTarget;
    const payload = {
      customer: {
        name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
        email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
        phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim(),
        addressLine1: (form.elements.namedItem("addressLine1") as HTMLInputElement).value.trim(),
        addressLine2: (form.elements.namedItem("addressLine2") as HTMLInputElement).value.trim(),
        city: (form.elements.namedItem("city") as HTMLInputElement).value.trim(),
        state: (form.elements.namedItem("state") as HTMLInputElement).value.trim(),
        zip: (form.elements.namedItem("zip") as HTMLInputElement).value.trim(),
        country: (form.elements.namedItem("country") as HTMLInputElement).value.trim(),
        details: (form.elements.namedItem("details") as HTMLTextAreaElement).value.trim(),
        paymentPreference: (form.elements.namedItem("paymentPreference") as HTMLSelectElement).value
      },
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        customizationText: item.customizationText
      }))
    };

    setState({ loading: true, error: null, success: null });
    try {
      await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.customer.name,
          phone: payload.customer.phone,
          addressLine1: payload.customer.addressLine1,
          addressLine2: payload.customer.addressLine2,
          city: payload.customer.city,
          state: payload.customer.state,
          zip: payload.customer.zip,
          country: payload.customer.country
        })
      });

      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await response.json()) as { error?: string; requestId?: string };
      if (!response.ok) throw new Error(data.error || "Falha ao enviar solicitação.");
      setState({
        loading: false,
        error: null,
        success: `Pedido enviado com sucesso. Referência: ${data.requestId}. Acompanhe em /track-order e aguarde nosso valor total.`
      });
      clear();
      form.reset();
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : "Erro ao enviar pedido.",
        success: null
      });
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-white">Carrinho e solicitação de pedido</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Adicione os itens, descreva o que precisa e envie. Você receberá o valor total e depois escolhe a forma de pagamento.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="tech-card rounded-2xl p-6">
          {items.length === 0 ? (
            <p className="text-zinc-400">Seu carrinho está vazio.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.productId} className="rounded-xl border border-white/10 bg-black/25 p-4">
                  <div className="flex flex-wrap items-start gap-4">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.title} width={96} height={72} unoptimized className="h-18 w-24 rounded-lg object-cover" />
                    ) : (
                      <div className="h-18 w-24 rounded-lg bg-white/10" />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="font-medium text-white">{item.title}</h2>
                        <span className="text-neon">${item.priceUsd.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="text-sm text-zinc-400">
                          Qtd.
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateQty(item.productId, Number(e.target.value))}
                            className="ml-2 w-16 rounded-md border border-white/15 bg-black/30 px-2 py-1 text-zinc-100"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-xs text-red-300 hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                      <textarea
                        value={item.customizationText}
                        onChange={(e) => updateCustomization(item.productId, e.target.value)}
                        rows={2}
                        placeholder="Detalhes deste item: cor, medida, gravação, prazo..."
                        className="w-full rounded-md border border-white/15 bg-black/30 p-2 text-sm text-zinc-200"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmit} className="tech-card space-y-4 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white">Enviar pedido</h2>
          <p className="text-sm text-zinc-400">Subtotal estimado: ${subtotal.toFixed(2)}</p>
          {!profileLoaded && <p className="text-xs text-zinc-500">Carregando seus dados cadastrados...</p>}
          <input name="name" required placeholder="Seu nome" className="w-full rounded-md border border-white/15 bg-black/30 p-2" />
          <input name="email" type="email" required placeholder="Seu e-mail" className="w-full rounded-md border border-white/15 bg-black/30 p-2" />
          <input name="phone" placeholder="Telefone / WhatsApp" className="w-full rounded-md border border-white/15 bg-black/30 p-2" />
          <input name="addressLine1" required placeholder="Endereço" className="w-full rounded-md border border-white/15 bg-black/30 p-2" />
          <input name="addressLine2" placeholder="Complemento" className="w-full rounded-md border border-white/15 bg-black/30 p-2" />
          <div className="grid gap-2 sm:grid-cols-3">
            <input name="city" required placeholder="Cidade" className="rounded-md border border-white/15 bg-black/30 p-2" />
            <input name="state" required placeholder="Estado" className="rounded-md border border-white/15 bg-black/30 p-2" />
            <input
              name="zip"
              required
              placeholder="ZIP"
              className="rounded-md border border-white/15 bg-black/30 p-2"
              onChange={(e) => setShippingEstimate(estimateShipping(e.target.value, items.reduce((s, i) => s + i.quantity, 0)))}
            />
          </div>
          <input name="country" defaultValue="USA" required placeholder="País" className="w-full rounded-md border border-white/15 bg-black/30 p-2" />
          {shippingEstimate !== null && (
            <p className="rounded-md border border-white/10 bg-black/20 p-2 text-xs text-zinc-300">
              Simulação de frete para ZIP informado: <span className="text-neon">${shippingEstimate.toFixed(2)}</span>
            </p>
          )}
          <select name="paymentPreference" className="w-full rounded-md border border-white/15 bg-black/30 p-2">
            <option value="card">Cartão</option>
            <option value="pix">PIX</option>
            <option value="bank_transfer">Transferência</option>
            <option value="to_be_defined">Definir depois</option>
          </select>
          <textarea
            name="details"
            rows={4}
            placeholder="Informações gerais do pedido (endereço, prazo, observações)..."
            className="w-full rounded-md border border-white/15 bg-black/30 p-2"
          />
          {state.error && <p className="text-sm text-red-300">{state.error}</p>}
          {state.success && <p className="text-sm text-emerald-300">{state.success}</p>}
          {state.success && (
            <Link href="/track-order" className="block text-xs text-neon hover:underline">
              Acompanhar andamento do pedido
            </Link>
          )}
          <button
            type="submit"
            disabled={state.loading}
            className="w-full rounded-lg bg-neon py-2.5 font-semibold text-black disabled:opacity-60"
          >
            {state.loading ? "Enviando..." : "Enviar pedido para orçamento"}
          </button>
        </form>
      </div>
    </section>
  );
}
