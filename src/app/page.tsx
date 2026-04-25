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
  stockQty?: number;
};

export default function Home() {
  const { locale } = useLocale();
  const t = useMemo(() => dictionary[locale], [locale]);
  const [onlineProducts, setOnlineProducts] = useState<OnlineCatalogProduct[]>([]);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(true);

  const copy =
    locale === "pt"
      ? {
          catalogTitle: "Catálogo online",
          catalogDesc: "Veja apenas os produtos disponíveis para compra no carrinho.",
          searchPlaceholder: "Buscar produto por nome, descrição ou tag...",
          details: "Ver detalhes",
          available: "Disponível online",
          noResults: "Nenhum produto encontrado para essa busca.",
          noProducts: "Nenhum produto disponível no momento.",
          filters: "Filtros",
          maxPrice: "Preço máximo",
          inStock: "Somente em estoque",
          productsFound: "produtos encontrados",
          sortLabel: "Ordenação",
          sortRelevance: "Relevância",
          sortPriceAsc: "Menor preço",
          sortPriceDesc: "Maior preço"
        }
      : locale === "es"
        ? {
            catalogTitle: "Catálogo online",
            catalogDesc: "Aquí se muestran solo productos disponibles para compra en el carrito.",
            searchPlaceholder: "Buscar por nombre, descripción o etiqueta...",
            details: "Ver detalles",
            available: "Disponible online",
            noResults: "No se encontraron productos para esta búsqueda.",
            noProducts: "No hay productos disponibles por ahora.",
            filters: "Filtros",
            maxPrice: "Precio máximo",
            inStock: "Solo en stock",
            productsFound: "productos encontrados",
            sortLabel: "Ordenar",
            sortRelevance: "Relevancia",
            sortPriceAsc: "Precio menor",
            sortPriceDesc: "Precio mayor"
          }
        : {
            catalogTitle: "Online catalog",
            catalogDesc: "Only products available for cart purchase are shown here.",
            searchPlaceholder: "Search by name, description, or tag...",
            details: "View details",
            available: "Available online",
            noResults: "No products found for this search.",
            noProducts: "No products available right now.",
            filters: "Filters",
            maxPrice: "Max price",
            inStock: "In-stock only",
            productsFound: "products found",
            sortLabel: "Sort",
            sortRelevance: "Relevance",
            sortPriceAsc: "Lowest price",
            sortPriceDesc: "Highest price"
          };
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc">("relevance");

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const base = onlineProducts.filter((item) => {
      const title = (item.title[locale] || item.title.en || "").toLowerCase();
      const description = (item.description[locale] || item.description.en || "").toLowerCase();
      const textMatch = !term || title.includes(term) || description.includes(term);
      const priceMatch = Number(item.priceUsd || 0) <= maxPrice;
      const stockMatch = !onlyInStock || Number(item.stockQty || 0) > 0;
      return textMatch && priceMatch && stockMatch;
    });
    if (sortBy === "price_asc") return [...base].sort((a, b) => Number(a.priceUsd) - Number(b.priceUsd));
    if (sortBy === "price_desc") return [...base].sort((a, b) => Number(b.priceUsd) - Number(a.priceUsd));
    return base;
  }, [onlineProducts, search, locale, maxPrice, onlyInStock, sortBy]);

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
            <p className="mt-2 text-xs text-zinc-500">
              {filteredProducts.length} {copy.productsFound}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 lg:hidden">
              <label className="text-xs text-zinc-400">{copy.sortLabel}</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "relevance" | "price_asc" | "price_desc")}
                className="rounded-md border border-white/15 bg-black/30 px-2 py-1.5 text-xs text-zinc-100"
              >
                <option value="relevance">{copy.sortRelevance}</option>
                <option value="price_asc">{copy.sortPriceAsc}</option>
                <option value="price_desc">{copy.sortPriceDesc}</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[230px_1fr]">
            <aside className="tech-card h-fit rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white">{copy.filters}</h3>
              <div className="mt-3 space-y-3">
                <label className="block text-xs text-zinc-500">
                  {copy.maxPrice}: ${maxPrice}
                  <input
                    type="range"
                    min={5}
                    max={500}
                    step={5}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="mt-1 w-full"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                  />
                  {copy.inStock}
                </label>
                <label className="block text-xs text-zinc-500">
                  {copy.sortLabel}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "relevance" | "price_asc" | "price_desc")}
                    className="mt-1 w-full rounded-md border border-white/15 bg-black/30 px-2 py-1.5 text-xs text-zinc-100"
                  >
                    <option value="relevance">{copy.sortRelevance}</option>
                    <option value="price_asc">{copy.sortPriceAsc}</option>
                    <option value="price_desc">{copy.sortPriceDesc}</option>
                  </select>
                </label>
              </div>
            </aside>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((item) => (
                  <article
                    key={item.id}
                    className="tech-card flex h-full flex-row gap-3 rounded-xl p-3 transition hover:border-neon/30 hover:ring-1 hover:ring-neon/20 md:flex-col md:gap-0"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title[locale] || item.title.en || "Product"}
                        width={640}
                        height={480}
                        unoptimized
                        className="h-28 w-28 shrink-0 rounded-lg object-cover ring-1 ring-white/10 md:mb-2 md:h-auto md:w-full md:aspect-[4/3]"
                      />
                    ) : (
                      <div className="h-28 w-28 shrink-0 rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 ring-1 ring-white/10 md:mb-2 md:h-auto md:w-full md:aspect-[4/3]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-300">{copy.available}</p>
                      <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-white md:text-base">
                        {item.title[locale] || item.title.en || "Produto"}
                      </h3>
                      <p className="mt-1 hidden text-xs text-zinc-300 md:block">
                        {item.description[locale] || item.description.en || "Descrição indisponível."}
                      </p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl">${Number(item.priceUsd).toFixed(2)}</p>
                      <Link
                        href={`/produto-online/${item.id}`}
                        className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-neon/40 py-1.5 text-xs text-neon hover:bg-neon/10 md:text-sm"
                      >
                        {copy.details}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-white/10 bg-black/25 p-4 text-sm text-zinc-400">
                {onlineProducts.length === 0 ? copy.noProducts : copy.noResults}
              </p>
            )}
          </div>
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
