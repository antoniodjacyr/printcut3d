"use client";

import Link from "next/link";
import { useMemo } from "react";
import { dictionary } from "@/lib/i18n";
import { useLocale } from "@/components/providers/locale-provider";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const { locale, setLocale } = useLocale();
  const t = useMemo(() => dictionary[locale], [locale]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-midnight/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-wide text-white">
          Print &amp; Cut 3D
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-zinc-200 md:flex">
          <Link href="/" className="hover:text-neon">
            {t.navMarketplace}
          </Link>
          <Link href="/dashboard" className="hover:text-neon">
            {t.navAdmin}
          </Link>
          <Link href="/quem-somos" className="hover:text-neon">
            {t.navAbout}
          </Link>
        </nav>

        <LanguageSwitcher selectedLocale={locale} onLocaleChange={setLocale} />
      </div>
    </header>
  );
}
