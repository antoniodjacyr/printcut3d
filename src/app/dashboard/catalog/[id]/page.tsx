"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export const runtime = "edge";

type ProductDetail = {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  priceUsd: number;
  weightLbs: number;
  widthIn: number;
  heightIn: number;
  depthIn: number;
  stockQty: number;
  variantLabel: string;
  seoTags: string[];
  isOnline: boolean;
  hasCustomization: boolean;
  imageUrl: string | null;
};

export default function EditCatalogProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductDetail | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/dashboard/products/${params.id}`, { cache: "no-store" });
        const data = (await response.json()) as { error?: string; product?: ProductDetail };
        if (!response.ok || !data.product) throw new Error(data.error || "Produto não encontrado.");
        setProduct(data.product);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar produto.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.id]);

  const initialTitle = useMemo(() => product?.title.pt || product?.title.en || "", [product]);
  const initialDescription = useMemo(() => product?.description.pt || product?.description.en || "", [product]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch(`/api/dashboard/products/${product.id}`, {
        method: "PATCH",
        body: formData
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Falha ao atualizar.");
      setSuccess("Produto atualizado com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar produto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Editar produto</h2>
        <button
          type="button"
          onClick={() => router.push("/dashboard/catalog")}
          className="rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200 hover:border-neon/40"
        >
          Voltar ao catálogo
        </button>
      </div>

      {loading && <p className="text-zinc-400">Carregando produto…</p>}
      {error && <p className="text-red-300">{error}</p>}

      {!loading && product && (
        <form onSubmit={handleSubmit} className="tech-card space-y-5 rounded-2xl p-6">
          {product.imageUrl && (
            <img src={product.imageUrl} alt="Produto" className="h-40 w-full rounded-xl object-cover ring-1 ring-white/10" />
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              Idioma original
              <select name="originalLanguage" defaultValue="pt" className="rounded-md border border-white/15 bg-black/20 p-2">
                <option value="pt">Português</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              Preço (USD)
              <input name="priceUsd" type="number" step="0.01" min="0.01" defaultValue={product.priceUsd} className="rounded-md border border-white/15 bg-black/20 p-2" />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Título
            <input name="title" defaultValue={initialTitle} className="rounded-md border border-white/15 bg-black/20 p-2" />
          </label>

          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Descrição
            <textarea name="description" rows={5} defaultValue={initialDescription} className="rounded-md border border-white/15 bg-black/20 p-2" />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <input name="weightLbs" type="number" step="0.001" min="0" defaultValue={product.weightLbs} placeholder="Peso (lbs)" className="rounded-md border border-white/15 bg-black/20 p-2" />
            <input name="widthIn" type="number" step="0.01" min="0" defaultValue={product.widthIn} placeholder="Largura (in)" className="rounded-md border border-white/15 bg-black/20 p-2" />
            <input name="heightIn" type="number" step="0.01" min="0" defaultValue={product.heightIn} placeholder="Altura (in)" className="rounded-md border border-white/15 bg-black/20 p-2" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <input name="depthIn" type="number" step="0.01" min="0" defaultValue={product.depthIn} placeholder="Profundidade (in)" className="rounded-md border border-white/15 bg-black/20 p-2" />
            <input name="stockQty" type="number" step="1" min="0" defaultValue={product.stockQty} placeholder="Estoque" className="rounded-md border border-white/15 bg-black/20 p-2" />
            <input name="variantLabel" defaultValue={product.variantLabel} placeholder="Variante" className="rounded-md border border-white/15 bg-black/20 p-2" />
          </div>

          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Tags SEO
            <input
              name="seoTags"
              defaultValue={product.seoTags.join(", ")}
              placeholder="tag1, tag2, ..."
              className="rounded-md border border-white/15 bg-black/20 p-2"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 rounded-md border border-white/15 bg-black/20 p-2">
              <input name="isOnline" type="checkbox" value="true" defaultChecked={product.isOnline} />
              <span className="text-sm text-zinc-300">Disponível online</span>
            </label>
            <label className="flex items-center gap-2 rounded-md border border-white/15 bg-black/20 p-2">
              <input name="hasCustomization" type="checkbox" value="true" defaultChecked={product.hasCustomization} />
              <span className="text-sm text-zinc-300">Permite personalização</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-zinc-300">Trocar fotos</label>
            <input name="images" type="file" accept="image/*" multiple className="block w-full text-sm text-zinc-300" />
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <input name="replaceImages" type="checkbox" value="true" defaultChecked />
              Substituir as fotos antigas pelas novas
            </label>
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}
          {success && <p className="text-sm text-emerald-300">{success}</p>}

          <button type="submit" disabled={saving} className="rounded-lg bg-neon px-5 py-2.5 font-semibold text-black disabled:opacity-60">
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      )}
    </section>
  );
}
