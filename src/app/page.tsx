"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { dictionary } from "@/lib/i18n";
import { useLocale } from "@/components/providers/locale-provider";

const highlights = [
  { key: "cat3d" as const, accent: "from-blue-600/30 to-cyan-500/10" },
  { key: "catLaser" as const, accent: "from-amber-500/25 to-orange-600/10" },
  { key: "catCustom" as const, accent: "from-slate-500/30 to-zinc-800/20" }
];

type OnlineCatalogProduct = {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  priceUsd: number;
  imageUrl: string | null;
};

export default function Home() {
  const { locale } = useLocale();
  const t = useMemo(() => dictionary[locale], [locale]);
  const [onlineProducts, setOnlineProducts] = useState<OnlineCatalogProduct[]>([]);
  const [search, setSearch] = useState("");

  const copy =
    locale === "pt"
      ? {
          catalogTitle: "Catálogo online",
          catalogDesc: "Veja apenas os produtos disponíveis para compra no carrinho.",
          searchPlaceholder: "Buscar produto por nome, descrição ou tag...",
          details: "Ver detalhes",
          available: "Disponível online",
          noResults: "Nenhum produto encontrado para essa busca.",
          noProducts: "Nenhum produto disponível no momento."
        }
      : locale === "es"
        ? {
            catalogTitle: "Catálogo online",
            catalogDesc: "Aquí se muestran solo productos disponibles para compra en el carrito.",
            searchPlaceholder: "Buscar por nombre, descripción o etiqueta...",
            details: "Ver detalles",
            available: "Disponible online",
            noResults: "No se encontraron productos para esta búsqueda.",
            noProducts: "No hay productos disponibles por ahora."
          }
        : {
            catalogTitle: "Online catalog",
            catalogDesc: "Only products available for cart purchase are shown here.",
            searchPlaceholder: "Search by name, description, or tag...",
            details: "View details",
            available: "Available online",
            noResults: "No products found for this search.",
            noProducts: "No products available right now."
          };

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return onlineProducts;
    return onlineProducts.filter((item) => {
      const title = (item.title[locale] || item.title.en || "").toLowerCase();
      const description = (item.description[locale] || item.description.en || "").toLowerCase();
      return title.includes(term) || description.includes(term);
    });
  }, [onlineProducts, search, locale]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/products/online", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { products?: OnlineCatalogProduct[] };
        setOnlineProducts(data.products ?? []);
      } catch {
        setOnlineProducts([]);
      }
    };
    void load();
  }, []);

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.12),transparent_40%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neon">{t.homeBadge}</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl">{t.homeHeadline}</h1>
            <p className="mt-5 max-w-xl text-lg text-zinc-300">{t.homeSub}</p>

            <div className="mt-8">
              <Link
                href="/#catalog"
                className="inline-flex rounded-lg bg-neon px-6 py-3 text-sm font-semibold text-black shadow-[0_0_24px_rgba(93,226,255,0.35)] hover:brightness-110"
              >
                {t.ctaShop}
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-neon/20 via-transparent to-amber-500/15 blur-2xl" />
              <Image
                src="/brand/logo.png"
                alt="Print & Cut 3D"
                width={520}
                height={520}
                className="relative mx-auto w-full max-w-sm rounded-3xl object-cover shadow-2xl ring-1 ring-white/15"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{t.sectionCats}</h2>
            <p className="text-sm text-zinc-400">{t.heroTitle}</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.key}
              className={`tech-card relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.accent} p-6`}
            >
              <h3 className="text-lg font-semibold text-white">{t[`${item.key}Title`]}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-200">{t[`${item.key}Body`]}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="catalog" className="border-y border-white/10 bg-black/20 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">{copy.catalogTitle}</h2>
            <p className="mt-1 text-sm text-zinc-500">{copy.catalogDesc}</p>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="mt-4 w-full max-w-xl rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-neon/50 focus:outline-none"
            />
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((item) => (
                <article
                  key={item.id}
                  className="tech-card flex h-full flex-col rounded-2xl p-4 transition hover:border-neon/30 hover:ring-1 hover:ring-neon/20"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title[locale] || item.title.en || "Product"}
                      width={640}
                      height={480}
                      unoptimized
                      className="mb-3 aspect-[4/2.6] w-full rounded-xl object-cover ring-1 ring-white/10"
                    />
                  ) : (
                    <div className="mb-3 aspect-[4/2.6] w-full rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 ring-1 ring-white/10" />
                  )}
                  <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-300">{copy.available}</p>
                  <h3 className="mt-1 text-base font-semibold text-white">{item.title[locale] || item.title.en || "Produto"}</h3>
                  <p className="mt-1 text-sm text-zinc-300">
                    {item.description[locale] || item.description.en || "Descrição indisponível."}
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">${Number(item.priceUsd).toFixed(2)}</p>
                  <Link
                    href={`/produto-online/${item.id}`}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-neon/40 py-1.5 text-sm text-neon hover:bg-neon/10"
                  >
                    {copy.details}
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-white/10 bg-black/25 p-4 text-sm text-zinc-400">
              {onlineProducts.length === 0 ? copy.noProducts : copy.noResults}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-neon">{t.sectionSoon}</p>
        <p className="mt-4 text-lg text-zinc-300">{t.sectionSoonBody}</p>
        <Link href="/quem-somos" className="mt-6 inline-block text-sm font-semibold text-neon hover:underline">
          {t.navAbout} →
        </Link>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-zinc-500">{t.footerTag}</footer>
    </div>
  );
}
