"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { dictionary } from "@/lib/i18n";
import { useLocale } from "@/components/providers/locale-provider";

const highlights = [
  { key: "cat3d" as const, accent: "from-blue-600/30 to-cyan-500/10" },
  { key: "catLaser" as const, accent: "from-amber-500/25 to-orange-600/10" },
  { key: "catCustom" as const, accent: "from-slate-500/30 to-zinc-800/20" }
];

const sampleSkus = [
  { name: "PETG housing kit", price: 48, badge: "Made-to-order" },
  { name: "Laser desk organizer", price: 36, badge: "Engravable" },
  { name: "Jig plate (ABS)", price: 62, badge: "Production" }
];

export default function Home() {
  const { locale } = useLocale();
  const t = useMemo(() => dictionary[locale], [locale]);

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.12),transparent_40%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neon">{t.homeBadge}</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl">{t.homeHeadline}</h1>
            <p className="mt-5 max-w-xl text-lg text-zinc-300">{t.homeSub}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/#catalog"
                className="rounded-lg bg-neon px-6 py-3 text-sm font-semibold text-black shadow-[0_0_24px_rgba(93,226,255,0.35)] hover:brightness-110"
              >
                {t.ctaShop}
              </Link>
              <Link
                href="mailto:sales@printcut3d.com?subject=Quote%20request"
                className="rounded-lg border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:border-neon/50 hover:text-neon"
              >
                {t.ctaQuote}
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-200 hover:border-white/30"
              >
                {t.ctaSeller}
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-zinc-400">
              <span className="rounded-full border border-white/10 px-3 py-1">{t.trustShip}</span>
              <span className="rounded-full border border-white/10 px-3 py-1">{t.trustPay}</span>
              <span className="rounded-full border border-white/10 px-3 py-1">{t.trustLang}</span>
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
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Featured builds</h2>
            <span className="text-xs uppercase tracking-widest text-zinc-500">USD · ships US</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sampleSkus.map((sku) => (
              <article key={sku.name} className="tech-card flex flex-col rounded-2xl p-5">
                <div className="mb-4 aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 ring-1 ring-white/10" />
                <p className="text-xs font-medium uppercase tracking-wide text-neon">{sku.badge}</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{sku.name}</h3>
                <p className="mt-2 text-2xl font-bold text-white">${sku.price.toFixed(2)}</p>
                <button
                  type="button"
                  className="mt-4 w-full rounded-lg border border-white/15 py-2 text-sm text-zinc-200 hover:border-neon/40 hover:text-neon"
                >
                  {t.ctaShop}
                </button>
              </article>
            ))}
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
