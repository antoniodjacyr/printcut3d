"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { dictionary } from "@/lib/i18n";
import { getBrowserSupabase } from "@/lib/supabase/client";
import type { SupabaseAnonKeyKind } from "@/lib/supabase/env-sanitize";

function mapAuthError(raw: string | undefined, t: (typeof dictionary)["en"]): string {
  const m = (raw ?? "").toLowerCase();
  if (m.includes("invalid api key") || m.includes("invalid jwt")) {
    return t.loginErrInvalidKey;
  }
  if (
    m.includes("email not confirmed") ||
    m.includes("email address not confirmed") ||
    (m.includes("not confirmed") && m.includes("email"))
  ) {
    return t.loginErrConfirmEmail;
  }
  if (m.includes("invalid login credentials")) {
    return t.loginErrBadCredentials;
  }
  if (raw?.trim()) {
    return `${t.loginErrGeneric} (${raw.trim()})`;
  }
  return t.loginErrGeneric;
}

export function LoginForm({
  urlPresent,
  keyMeta
}: {
  urlPresent: boolean;
  keyMeta: { present: boolean; kind: SupabaseAnonKeyKind };
}) {
  const { locale } = useLocale();
  const t = useMemo(() => dictionary[locale], [locale]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const configOk = urlPresent && keyMeta.present;
  const envBanner = !configOk
    ? t.loginEnvMissing
    : keyMeta.kind === "publishable"
      ? t.loginEnvPublishable
      : keyMeta.kind === "other"
        ? t.loginEnvOtherKey
        : null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError(t.loginEnvMissing);
      setLoading(false);
      return;
    }

    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement | null)?.value ?? "";

    if (mode === "signup") {
      if (password.length < 6) {
        setError(t.loginSignupPasswordTooShort || "A senha deve ter ao menos 6 caracteres.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError(t.loginSignupPasswordMismatch || "As senhas não coincidem.");
        setLoading(false);
        return;
      }
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message || t.loginErrGeneric);
        setLoading(false);
        return;
      }
      setNotice(
        t.loginSignupSuccess ||
          "Conta criada com sucesso. Verifique seu e-mail para confirmar a conta, depois faça login."
      );
      setMode("signin");
      form.reset();
      setLoading(false);
      return;
    }

    const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
    if (signError) {
      setError(mapAuthError(signError.message, t));
      setLoading(false);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden px-4 py-12 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(93,226,255,0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(167,139,250,0.12), transparent)"
        }}
      />

      <section className="relative mx-auto max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neon/90">Print & Cut 3D</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{t.loginTitle}</h1>
          <p className="mt-2 text-sm text-zinc-400">{t.loginSubtitle}</p>
        </div>

        <div className="tech-card rounded-2xl border border-white/10 p-8 shadow-[0_0_0_1px_rgba(93,226,255,0.06)]">
          {envBanner && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm leading-relaxed ${
                !configOk
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
                  : "border-neon/30 bg-neon/5 text-zinc-200"
              }`}
            >
              {envBanner}
            </div>
          )}

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/25 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setNotice(null);
              }}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                mode === "signin" ? "bg-neon/20 text-neon" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.loginSubmit}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setNotice(null);
              }}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                mode === "signup" ? "bg-neon/20 text-neon" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.loginSignupTab || "Criar conta"}
            </button>
          </div>

          <form className="space-y-5" onSubmit={(e) => void handleSubmit(e)}>
            <label className="block text-sm font-medium text-zinc-300">
              {t.loginEmail}
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none ring-neon/0 transition placeholder:text-zinc-600 focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
                placeholder="you@example.com"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-300">
              {t.loginPassword}
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none transition focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
              />
            </label>
            {mode === "signup" && (
              <label className="block text-sm font-medium text-zinc-300">
                {t.loginSignupConfirmPassword || "Confirmar senha"}
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none transition focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
                />
              </label>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}
            {notice && (
              <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-neon py-3 text-sm font-semibold text-black shadow-[0_0_24px_rgba(93,226,255,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t.loginLoading : mode === "signin" ? t.loginSubmit : t.loginSignupSubmit || "Criar conta"}
            </button>
          </form>

          <details className="mt-6 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
            <summary className="cursor-pointer select-none font-medium text-zinc-300 hover:text-white">
              {t.loginHelpToggle}
            </summary>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-xs leading-relaxed text-zinc-400">
              <li>{t.loginHelpL1}</li>
              <li>{t.loginHelpL2}</li>
              <li>{t.loginHelpL3}</li>
            </ol>
          </details>

          <p className="mt-6 text-center text-sm text-zinc-500">
            <Link href="/" className="text-neon transition hover:text-white hover:underline">
              ← {t.navMarketplace}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
