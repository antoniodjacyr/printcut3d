"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";

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
  const { locale } = useLocale();
  const copy =
    locale === "pt"
      ? {
          notFound: "Produto não encontrado.",
          loadError: "Erro ao carregar produto.",
          updateFail: "Falha ao atualizar.",
          updated: "Produto atualizado com sucesso.",
          updateError: "Erro ao atualizar produto.",
          pageTitle: "Editar produto",
          back: "Voltar ao catálogo",
          loading: "Carregando produto…",
          originalLanguage: "Idioma original",
          price: "Preço (USD)",
          title: "Título",
          description: "Descrição",
          weight: "Peso (lbs)",
          width: "Largura (in)",
          height: "Altura (in)",
          depth: "Profundidade (in)",
          stock: "Estoque",
          variant: "Variante",
          seoTags: "Tags SEO",
          online: "Disponível online",
          customization: "Permite personalização",
          replacePhotos: "Trocar fotos",
          replaceOld: "Substituir as fotos antigas pelas novas",
          saving: "Salvando...",
          save: "Salvar alterações"
        }
      : locale === "es"
        ? {
            notFound: "Producto no encontrado.",
            loadError: "Error al cargar el producto.",
            updateFail: "No se pudo actualizar.",
            updated: "Producto actualizado correctamente.",
            updateError: "Error al actualizar el producto.",
            pageTitle: "Editar producto",
            back: "Volver al catálogo",
            loading: "Cargando producto…",
            originalLanguage: "Idioma original",
            price: "Precio (USD)",
            title: "Título",
            description: "Descripción",
            weight: "Peso (lbs)",
            width: "Ancho (in)",
            height: "Alto (in)",
            depth: "Profundidad (in)",
            stock: "Stock",
            variant: "Variante",
            seoTags: "Etiquetas SEO",
            online: "Disponible online",
            customization: "Permite personalización",
            replacePhotos: "Cambiar fotos",
            replaceOld: "Reemplazar fotos antiguas por nuevas",
            saving: "Guardando...",
            save: "Guardar cambios"
          }
        : {
            notFound: "Product not found.",
            loadError: "Error loading product.",
            updateFail: "Failed to update.",
            updated: "Product updated successfully.",
            updateError: "Error updating product.",
            pageTitle: "Edit product",
            back: "Back to catalog",
            loading: "Loading product…",
            originalLanguage: "Original language",
            price: "Price (USD)",
            title: "Title",
            description: "Description",
            weight: "Weight (lbs)",
            width: "Width (in)",
            height: "Height (in)",
            depth: "Depth (in)",
            stock: "Stock",
            variant: "Variant",
            seoTags: "SEO tags",
            online: "Available online",
            customization: "Allows customization",
            replacePhotos: "Replace photos",
            replaceOld: "Replace old photos with new ones",
            saving: "Saving...",
            save: "Save changes"
          };
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
        if (!response.ok || !data.product) throw new Error(data.error || copy.notFound);
        setProduct(data.product);
      } catch (err) {
        setError(err instanceof Error ? err.message : copy.loadError);
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
      if (!response.ok) throw new Error(data.error || copy.updateFail);
      setSuccess(copy.updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.updateError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{copy.pageTitle}</h2>
        <button
          type="button"
          onClick={() => router.push("/dashboard/catalog")}
          className="rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200 hover:border-neon/40"
        >
          {copy.back}
        </button>
      </div>

      {loading && <p className="text-zinc-400">{copy.loading}</p>}
      {error && <p className="text-red-300">{error}</p>}

      {!loading && product && (
        <form onSubmit={handleSubmit} className="tech-card space-y-5 rounded-2xl p-6">
          {product.imageUrl && (
            <img src={product.imageUrl} alt="Produto" className="h-40 w-full rounded-xl object-cover ring-1 ring-white/10" />
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              {copy.originalLanguage}
              <select name="originalLanguage" defaultValue="pt" className="rounded-md border border-white/15 bg-black/20 p-2">
                <option value="pt">Português</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-300">
              {copy.price}
              <input name="priceUsd" type="number" step="0.01" min="0.01" defaultValue={product.priceUsd} className="rounded-md border border-white/15 bg-black/20 p-2" />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            {copy.title}
            <input name="title" defaultValue={initialTitle} className="rounded-md border border-white/15 bg-black/20 p-2" />
          </label>

          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            {copy.description}
            <textarea name="description" rows={5} defaultValue={initialDescription} className="rounded-md border border-white/15 bg-black/20 p-2" />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <input name="weightLbs" type="number" step="0.001" min="0" defaultValue={product.weightLbs} placeholder={copy.weight} className="rounded-md border border-white/15 bg-black/20 p-2" />
            <input name="widthIn" type="number" step="0.01" min="0" defaultValue={product.widthIn} placeholder={copy.width} className="rounded-md border border-white/15 bg-black/20 p-2" />
            <input name="heightIn" type="number" step="0.01" min="0" defaultValue={product.heightIn} placeholder={copy.height} className="rounded-md border border-white/15 bg-black/20 p-2" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <input name="depthIn" type="number" step="0.01" min="0" defaultValue={product.depthIn} placeholder={copy.depth} className="rounded-md border border-white/15 bg-black/20 p-2" />
            <input name="stockQty" type="number" step="1" min="0" defaultValue={product.stockQty} placeholder={copy.stock} className="rounded-md border border-white/15 bg-black/20 p-2" />
            <input name="variantLabel" defaultValue={product.variantLabel} placeholder={copy.variant} className="rounded-md border border-white/15 bg-black/20 p-2" />
          </div>

          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            {copy.seoTags}
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
              <span className="text-sm text-zinc-300">{copy.online}</span>
            </label>
            <label className="flex items-center gap-2 rounded-md border border-white/15 bg-black/20 p-2">
              <input name="hasCustomization" type="checkbox" value="true" defaultChecked={product.hasCustomization} />
              <span className="text-sm text-zinc-300">{copy.customization}</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-zinc-300">{copy.replacePhotos}</label>
            <input name="images" type="file" accept="image/*" multiple className="block w-full text-sm text-zinc-300" />
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <input name="replaceImages" type="checkbox" value="true" defaultChecked />
              {copy.replaceOld}
            </label>
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}
          {success && <p className="text-sm text-emerald-300">{success}</p>}

          <button type="submit" disabled={saving} className="rounded-lg bg-neon px-5 py-2.5 font-semibold text-black disabled:opacity-60">
            {saving ? copy.saving : copy.save}
          </button>
        </form>
      )}
    </section>
  );
}
