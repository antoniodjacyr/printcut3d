import { Suspense } from "react";
import { getSupabaseAnonKeyMeta, sanitizeSupabaseUrl } from "@/lib/supabase/env-sanitize";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  const urlPresent = Boolean(sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL));
  const keyMeta = getSupabaseAnonKeyMeta(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <Suspense fallback={<div className="py-24 text-center text-zinc-400">…</div>}>
      <LoginForm urlPresent={urlPresent} keyMeta={keyMeta} />
    </Suspense>
  );
}
