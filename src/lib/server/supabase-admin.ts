import { createClient } from "@supabase/supabase-js";
import { sanitizeSupabaseKey, sanitizeSupabaseUrl } from "@/lib/supabase/env-sanitize";

export const getSupabaseAdmin = () => {
  const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = sanitizeSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  try {
    const parsed = new URL(supabaseUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("protocol");
    }
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL inválida. No Cloudflare, use exatamente a Project URL do Supabase (https://xxxx.supabase.co), sem aspas e sem espaço no início/fim."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });
};
