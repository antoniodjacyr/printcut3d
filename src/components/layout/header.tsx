"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { dictionary } from "@/lib/i18n";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useLocale } from "@/components/providers/locale-provider";
import { useCart } from "@/components/providers/cart-provider";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const { locale, setLocale } = useLocale();
  const t = useMemo(() => dictionary[locale], [locale]);
  const [user, setUser] = useState<User | null>(null);
  const { itemCount } = useCart();
  const pathname = usePathname();
  const inAdminArea = pathname?.startsWith("/dashboard") ?? false;

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    let cancelled = false;
    void supabase.auth.getUser().then((result: { data: { user: User | null } }) => {
      if (!cancelled) setUser(result.data.user ?? null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-midnight/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3 text-white">
          <Image
            src="/brand/logo.png"
            alt="Print & Cut 3D"
            width={48}
            height={48}
            className="h-11 w-11 rounded-lg object-cover ring-1 ring-white/15"
            priority
          />
          <span className="hidden text-lg font-semibold tracking-wide sm:inline">Print &amp; Cut 3D</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm text-zinc-200 md:gap-6">
          <Link href="/" className="hover:text-neon">
            {t.navMarketplace}
          </Link>
          <Link href="/cart" className="relative hover:text-neon">
            Carrinho
            {itemCount > 0 && (
              <span className="ml-2 rounded-full bg-neon px-2 py-0.5 text-[10px] font-semibold text-black">
                {itemCount}
              </span>
            )}
          </Link>
          <Link href="/quem-somos" className="hover:text-neon">
            {t.navAbout}
          </Link>
          {user ? (
            <>
              {!inAdminArea && (
                <Link href="/minha-conta" className="hover:text-neon">
                  Minha conta
                </Link>
              )}
              <Link href="/dashboard" className="hover:text-neon">
                {t.navAdmin}
              </Link>
              <button type="button" onClick={() => void signOut()} className="hover:text-neon">
                {t.navLogout}
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-full border border-neon/40 px-3 py-1 text-neon hover:bg-neon/10">
              {t.navLogin}
            </Link>
          )}
        </nav>

        <LanguageSwitcher selectedLocale={locale} onLocaleChange={setLocale} />
      </div>
    </header>
  );
}
