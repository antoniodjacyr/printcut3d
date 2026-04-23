"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MockProduct } from "@/lib/mock-catalog";
import { dictionary } from "@/lib/i18n";
import { useLocale } from "@/components/providers/locale-provider";

type ProductViewProps = {
  product: MockProduct;
};

export function ProductView({ product }: ProductViewProps) {
  const { locale } = useLocale();
  const t = useMemo(() => dictionary[locale], [locale]);
  const [previewText, setPreviewText] = useState("PRINT & CUT");

  const title = product.title[locale];
  const description = product.description[locale];
  const badge = product.shortBadge[locale];
  const material = product.material[locale];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/#catalog" className="text-sm text-neon hover:underline">
        ← {t.productBack}
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="aspect-square w-full max-w-md rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 ring-1 ring-white/10 lg:max-w-none" />

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neon">{badge}</p>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">{title}</h1>
          <p className="mt-4 text-3xl font-bold text-white">${product.priceUsd.toFixed(2)} USD</p>

          <p className="mt-6 text-base leading-relaxed text-zinc-300">{description}</p>

          <dl className="mt-8 space-y-3 rounded-xl border border-white/10 bg-white/5 p-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-400">{t.productMaterial}</dt>
              <dd className="text-right text-zinc-100">{material}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-400">{t.productWeight}</dt>
              <dd className="text-right text-zinc-100">{product.weightLbs} lbs</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-400">{t.productDimensions}</dt>
              <dd className="text-right text-zinc-100">
                {product.dimensionsIn.width} × {product.dimensionsIn.height} × {product.dimensionsIn.depth} in
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-400">{t.productCustomization}</dt>
              <dd className="text-right text-zinc-100">{product.hasCustomization ? t.productYes : t.productNo}</dd>
            </div>
          </dl>

          {product.hasCustomization && (
            <div className="mt-8">
              <p className="text-sm font-medium text-zinc-300">{t.productPreviewLabel}</p>
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value.slice(0, 24))}
                className="mt-2 w-full max-w-md rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
                maxLength={24}
              />
              <div className="mt-3 flex h-24 max-w-md items-center justify-center rounded-lg border border-dashed border-white/20 bg-gradient-to-b from-slate-900 to-slate-950">
                <span
                  className="select-none font-semibold tracking-widest text-neon/90 drop-shadow-[0_0_12px_rgba(93,226,255,0.35)]"
                  style={{ fontSize: "clamp(0.65rem, 2.5vw, 1rem)" }}
                >
                  {previewText || "—"}
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            disabled
            className="mt-10 w-full max-w-md cursor-not-allowed rounded-lg border border-white/15 py-3 text-sm font-semibold text-zinc-500"
            title={t.productCheckoutSoon}
          >
            {t.productCheckoutSoon}
          </button>
        </div>
      </div>
    </div>
  );
}
