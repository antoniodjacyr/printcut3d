"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";
import { useCart } from "@/components/providers/cart-provider";

export const runtime = "edge";

type ProductDetail = {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  priceUsd: number;
  imageUrl: string | null;
  weightLbs: number;
  hasCustomization: boolean;
  dimensionsIn: { width: number; height: number; depth: number };
  stockQty: number;
  variantLabel: string;
  seoTags: string[];
};

export default function ProdutoOnlinePage() {
  const { locale } = useLocale();
  const { addItem } = useCart();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductDetail | null>(null);

  const title = useMemo(() => {
    if (!product) return "";
    return product.title[locale] || product.title.en || "Produto";
  }, [product, locale]);

  const description = useMemo(() => {
    if (!product) return "";
    return product.description[locale] || product.description.en || "";
  }, [product, locale]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/products/online/${params.id}`, { cache: "no-store" });
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

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      {loading && <p className="text-zinc-400">Carregando produto…</p>}
      {error && <p className="text-red-300">{error}</p>}
      {!loading && !error && product && (
        <article className="tech-card grid gap-6 rounded-2xl p-6 md:grid-cols-[1fr_1fr]">
          <div>
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={title} width={900} height={700} unoptimized className="w-full rounded-xl object-cover" />
            ) : (
              <div className="aspect-[4/3] w-full rounded-xl bg-white/10" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            <p className="mt-2 text-zinc-300">{description}</p>
            <p className="mt-4 text-2xl font-bold text-white">${Number(product.priceUsd).toFixed(2)}</p>
            <ul className="mt-4 space-y-1 text-sm text-zinc-400">
              <li>Estoque: {product.stockQty}</li>
              <li>Variante: {product.variantLabel || "-"}</li>
              <li>Peso: {product.weightLbs.toFixed(3)} lbs</li>
              <li>
                Dimensões: {product.dimensionsIn.width} × {product.dimensionsIn.height} × {product.dimensionsIn.depth} in
              </li>
              <li>Personalização: {product.hasCustomization ? "Sim" : "Não"}</li>
            </ul>
            {product.seoTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.seoTags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-zinc-300">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() =>
                addItem({
                  productId: product.id,
                  title,
                  priceUsd: Number(product.priceUsd || 0),
                  imageUrl: product.imageUrl
                })
              }
              className="mt-6 rounded-lg bg-neon px-5 py-2.5 font-semibold text-black"
            >
              Adicionar ao carrinho
            </button>
          </div>
        </article>
      )}
    </section>
  );
}
