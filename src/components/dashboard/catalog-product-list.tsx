"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";

type DashboardProduct = {
  id: string;
  title: string;
  priceUsd: number;
  stockQty: number;
  variantLabel: string;
  isOnline: boolean;
  imageUrl: string | null;
};

export function CatalogProductList({ refreshToken }: { refreshToken: number }) {
  const { locale } = useLocale();
  const copy =
    locale === "pt"
      ? {
          title: "Produtos cadastrados",
          subtitle: "Ative Disponível online para exibir no catálogo do comprador.",
          loading: "Carregando produtos…",
          empty: "Nenhum produto cadastrado ainda.",
          product: "Produto",
          price: "Preço",
          stock: "Estoque",
          variant: "Variante",
          edit: "Editar",
          online: "Online",
          saving: "Salvando…",
          available: "Disponível",
          offline: "Offline"
        }
      : locale === "es"
        ? {
            title: "Productos registrados",
            subtitle: "Activa Disponible online para mostrar en el catálogo del comprador.",
            loading: "Cargando productos…",
            empty: "Aún no hay productos registrados.",
            product: "Producto",
            price: "Precio",
            stock: "Stock",
            variant: "Variante",
            edit: "Editar",
            online: "Online",
            saving: "Guardando…",
            available: "Disponible",
            offline: "Offline"
          }
        : {
            title: "Registered products",
            subtitle: "Enable Available online to show in buyer catalog.",
            loading: "Loading products…",
            empty: "No products registered yet.",
            product: "Product",
            price: "Price",
            stock: "Stock",
            variant: "Variant",
            edit: "Edit",
            online: "Online",
            saving: "Saving…",
            available: "Available",
            offline: "Offline"
          };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<DashboardProduct[]>([]);
  const [pendingIds, setPendingIds] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/dashboard/products", { cache: "no-store" });
      const data = (await response.json()) as { error?: string; products?: DashboardProduct[] };
      if (!response.ok) throw new Error(data.error || "Falha ao carregar produtos.");
      setItems(data.products ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [refreshToken]);

  const toggleOnline = async (productId: string, isOnline: boolean) => {
    setPendingIds((p) => ({ ...p, [productId]: true }));
    try {
      const response = await fetch("/api/dashboard/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, isOnline })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Falha ao atualizar disponibilidade.");
      setItems((prev) => prev.map((item) => (item.id === productId ? { ...item, isOnline } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar produto.");
    } finally {
      setPendingIds((p) => ({ ...p, [productId]: false }));
    }
  };

  return (
    <section className="tech-card rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white">{copy.title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{copy.subtitle}</p>

      {loading && <p className="mt-4 text-sm text-zinc-400">{copy.loading}</p>}
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="mt-4 text-sm text-zinc-500">{copy.empty}</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="pb-2 pr-4">{copy.product}</th>
                <th className="pb-2 pr-4">{copy.price}</th>
                <th className="pb-2 pr-4">{copy.stock}</th>
                <th className="pb-2 pr-4">{copy.variant}</th>
                <th className="pb-2 pr-4">{copy.edit}</th>
                <th className="pb-2">{copy.online}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white/10" style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} />
                      <span className="font-medium text-zinc-100">{item.title}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">${Number(item.priceUsd).toFixed(2)}</td>
                  <td className="py-3 pr-4">{item.stockQty || 0}</td>
                  <td className="py-3 pr-4">{item.variantLabel || "-"}</td>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/dashboard/catalog/${item.id}`}
                      className="rounded-md border border-neon/40 px-3 py-1 text-xs text-neon hover:bg-neon/10"
                    >
                      {copy.edit}
                    </Link>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      disabled={pendingIds[item.id] === true}
                      onClick={() => void toggleOnline(item.id, !item.isOnline)}
                      className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                        item.isOnline ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-700/30 text-zinc-300"
                      } disabled:opacity-60`}
                    >
                      {pendingIds[item.id] ? copy.saving : item.isOnline ? copy.available : copy.offline}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
