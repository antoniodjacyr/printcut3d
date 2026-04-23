"use client";

import { useMemo } from "react";
import Link from "next/link";
import { dictionary } from "@/lib/i18n";
import { useLocale } from "@/components/providers/locale-provider";

export default function Home() {
  const { locale } = useLocale();
  const t = useMemo(() => dictionary[locale], [locale]);

  return (
    <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl place-items-center px-6 py-16">
      <div className="tech-card max-w-3xl rounded-2xl p-10">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-neon">Print &amp; Cut 3D Platform</p>
        <h1 className="mb-4 text-4xl font-bold leading-tight">{t.heroTitle}</h1>
        <p className="text-lg text-zinc-200">{t.heroBody}</p>
        <div className="mt-8 text-sm text-zinc-400">{`Locale ativo: ${locale.toUpperCase()}`}</div>
        <div className="mt-6">
          <Link href="/dashboard" className="rounded-lg bg-neon px-4 py-2 font-semibold text-black">
            Abrir Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
