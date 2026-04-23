"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { dictionary } from "@/lib/i18n";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useLocale } from "@/components/providers/locale-provider";

export function LoginForm() {
  const { locale } = useLocale();
  const t = useMemo(() => dictionary[locale], [locale]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Supabase não configurado (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).");
      setLoading(false);
      return;
    }

    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
    if (signError) {
      const detail = signError.message?.trim();
      setError(detail ? `${t.loginError} (${detail})` : t.loginError);
      setLoading(false);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-lg flex-col justify-center px-6 py-16">
      <div className="tech-card rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white">{t.loginTitle}</h1>
        <p className="mt-2 text-sm text-zinc-400">{t.loginSubtitle}</p>
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">{t.loginHint}</p>

        <form className="mt-8 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
          <label className="block text-sm text-zinc-300">
            {t.loginEmail}
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-zinc-300">
            {t.loginPassword}
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
            />
          </label>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-neon py-2.5 font-semibold text-black hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "…" : t.loginSubmit}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/" className="text-neon hover:underline">
            ← {t.navMarketplace}
          </Link>
        </p>
      </div>
    </section>
  );
}
