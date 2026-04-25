"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { dictionary } from "@/lib/i18n";
import { getBrowserSupabase } from "@/lib/supabase/client";
import type { SupabaseAnonKeyKind } from "@/lib/supabase/env-sanitize";

const COUNTRY_OPTIONS = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Peru" },
  { code: "UY", name: "Uruguay" },
  { code: "PY", name: "Paraguay" },
  { code: "EC", name: "Ecuador" },
  { code: "VE", name: "Venezuela" },
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "PT", name: "Portugal" },
  { code: "ES", name: "Spain" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "JP", name: "Japan" }
] as const;

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
  const nextPath = searchParams.get("next") || "/minha-conta";

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [countryCode, setCountryCode] = useState("US");
  const [cityValue, setCityValue] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [zipLookupLoading, setZipLookupLoading] = useState(false);
  const [zipLookupMessage, setZipLookupMessage] = useState<string | null>(null);

  const configOk = urlPresent && keyMeta.present;
  const envBanner = !configOk
    ? t.loginEnvMissing
    : keyMeta.kind === "publishable"
      ? t.loginEnvPublishable
      : keyMeta.kind === "other"
        ? t.loginEnvOtherKey
        : null;

  const fillCityAndStateByZip = async (zip: string, selectedCountryCode: string) => {
    const cleanZip = zip.trim();
    if (!cleanZip) return;
    setZipLookupLoading(true);
    setZipLookupMessage(null);
    try {
      const response = await fetch(
        `https://api.zippopotam.us/${selectedCountryCode.toLowerCase()}/${encodeURIComponent(cleanZip)}`
      );
      if (!response.ok) {
        setZipLookupMessage(
          locale === "pt"
            ? "Não foi possível localizar cidade/estado com esse ZIP."
            : locale === "es"
              ? "No fue posible encontrar ciudad/estado con este código postal."
              : "Could not find city/state from this ZIP code."
        );
        return;
      }
      const data = (await response.json()) as {
        places?: Array<{ "place name"?: string; state?: string; "state abbreviation"?: string }>;
      };
      const first = data.places?.[0];
      if (!first) return;
      const nextCity = first["place name"]?.trim() || "";
      const nextState = first["state abbreviation"]?.trim() || first.state?.trim() || "";
      if (nextCity) setCityValue(nextCity);
      if (nextState) setStateValue(nextState);
      setZipLookupMessage(
        locale === "pt"
          ? "Cidade e estado preenchidos automaticamente."
          : locale === "es"
            ? "Ciudad y estado completados automáticamente."
            : "City and state were auto-filled."
      );
    } catch {
      setZipLookupMessage(
        locale === "pt"
          ? "Não foi possível consultar o ZIP agora."
          : locale === "es"
            ? "No fue posible consultar el código postal ahora."
            : "Could not query ZIP code right now."
      );
    } finally {
      setZipLookupLoading(false);
    }
  };

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
    const firstName = (form.elements.namedItem("firstName") as HTMLInputElement | null)?.value?.trim() ?? "";
    const lastName = (form.elements.namedItem("lastName") as HTMLInputElement | null)?.value?.trim() ?? "";
    const phone = (form.elements.namedItem("phone") as HTMLInputElement | null)?.value?.trim() ?? "";
    const addressLine1 = (form.elements.namedItem("addressLine1") as HTMLInputElement | null)?.value?.trim() ?? "";
    const addressLine2 = (form.elements.namedItem("addressLine2") as HTMLInputElement | null)?.value?.trim() ?? "";
    const city = (form.elements.namedItem("city") as HTMLInputElement | null)?.value?.trim() ?? cityValue.trim();
    const state = (form.elements.namedItem("state") as HTMLInputElement | null)?.value?.trim() ?? stateValue.trim();
    const zip = (form.elements.namedItem("zip") as HTMLInputElement | null)?.value?.trim() ?? "";
    const selectedCountryCode =
      (form.elements.namedItem("country") as HTMLSelectElement | null)?.value?.trim() || countryCode;
    const country = COUNTRY_OPTIONS.find((option) => option.code === selectedCountryCode)?.name || selectedCountryCode;

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
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim(),
            phone,
            address_line1: addressLine1,
            address_line2: addressLine2,
            city,
            state,
            zip,
            country,
            country_code: selectedCountryCode
          }
        }
      });
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
                setZipLookupMessage(null);
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
                setZipLookupMessage(null);
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
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-zinc-300">
                    {t.loginSignupFirstName || "Nome"}
                    <input
                      name="firstName"
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none transition focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
                    />
                  </label>
                  <label className="block text-sm font-medium text-zinc-300">
                    {t.loginSignupLastName || "Sobrenome"}
                    <input
                      name="lastName"
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none transition focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
                    />
                  </label>
                </div>

                <label className="block text-sm font-medium text-zinc-300">
                  {t.loginSignupPhone || "Telefone"}
                  <input
                    name="phone"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none transition focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
                  />
                </label>

                <label className="block text-sm font-medium text-zinc-300">
                  {t.loginSignupAddress1 || "Endereço"}
                  <input
                    name="addressLine1"
                    required
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none transition focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
                  />
                </label>
                <label className="block text-sm font-medium text-zinc-300">
                  {t.loginSignupAddress2 || "Complemento"}
                  <input
                    name="addressLine2"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none transition focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-zinc-300">
                    {t.loginSignupCountry || "Country"}
                    <select
                      name="country"
                      value={countryCode}
                      onChange={(event) => setCountryCode(event.target.value)}
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none transition focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
                    >
                      {COUNTRY_OPTIONS.map((country) => (
                        <option key={country.code} value={country.code} className="bg-[#0b1020]">
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-zinc-300">
                    ZIP
                    <input
                      name="zip"
                      required
                      onBlur={(event) => void fillCityAndStateByZip(event.target.value, countryCode)}
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none transition focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
                    />
                  </label>
                </div>
                {(zipLookupLoading || zipLookupMessage) && (
                  <p className="text-xs text-zinc-400">
                    {zipLookupLoading
                      ? locale === "pt"
                        ? "Buscando cidade e estado..."
                        : locale === "es"
                          ? "Buscando ciudad y estado..."
                          : "Looking up city and state..."
                      : zipLookupMessage}
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-zinc-300">
                    {t.loginSignupCity || "City"}
                    <input
                      name="city"
                      required
                      value={cityValue}
                      onChange={(event) => setCityValue(event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none transition focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
                    />
                  </label>
                  <label className="block text-sm font-medium text-zinc-300">
                    {t.loginSignupState || "State"}
                    <input
                      name="state"
                      value={stateValue}
                      onChange={(event) => setStateValue(event.target.value)}
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-white outline-none transition focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
                    />
                  </label>
                </div>

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
              </>
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
