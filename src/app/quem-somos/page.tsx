"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { aboutDictionary, dictionary } from "@/lib/i18n";
import { useLocale } from "@/components/providers/locale-provider";

export default function AboutPage() {
  const { locale } = useLocale();
  const t = useMemo(() => dictionary[locale], [locale]);
  const about = useMemo(() => aboutDictionary[locale], [locale]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center">
        <Image
          src="/brand/logo.png"
          alt="Print & Cut 3D"
          width={120}
          height={120}
          className="h-28 w-28 shrink-0 rounded-2xl object-cover ring-1 ring-white/15"
          priority
        />
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-neon">{t.homeBadge}</p>
          <h1 className="mt-2 text-4xl font-bold text-white">{about.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-300">{t.heroBody}</p>
          <Link href="/" className="mt-4 inline-block text-sm text-neon hover:underline">
            ← {t.navMarketplace}
          </Link>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {about.blocks.map((block) => (
          <article key={block.title} className="tech-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white">{block.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{block.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-950/60 via-midnight to-graphite/80 p-10 text-center">
        <p className="text-sm uppercase tracking-widest text-neon">{t.sectionSoon}</p>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-200">{t.sectionSoonBody}</p>
      </div>
    </div>
  );
}
