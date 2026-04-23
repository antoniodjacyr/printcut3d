import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeSupabaseKey, sanitizeSupabaseUrl } from "@/lib/supabase/env-sanitize";

export function getBrowserSupabase(): SupabaseClient | null {
  const url = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = sanitizeSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url || !anonKey) {
    return null;
  }
  return createBrowserClient(url, anonKey);
}
