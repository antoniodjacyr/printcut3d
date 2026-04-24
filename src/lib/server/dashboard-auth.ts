import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { SupabaseCookieToSet } from "@/lib/supabase/cookie-types";
import { sanitizeSupabaseKey, sanitizeSupabaseUrl } from "@/lib/supabase/env-sanitize";

export async function requireDashboardUser(): Promise<{ user: User } | { response: NextResponse }> {
  const publicUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = sanitizeSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!publicUrl || !anonKey) {
    return {
      response: NextResponse.json({ error: "Auth não configurado (NEXT_PUBLIC_SUPABASE_ANON_KEY)." }, { status: 503 })
    };
  }

  const cookieStore = await cookies();
  const authClient = createServerClient(publicUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: SupabaseCookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
          );
        } catch {
          /* ignore */
        }
      }
    }
  });

  const {
    data: { user }
  } = await authClient.auth.getUser();
  if (!user) {
    return { response: NextResponse.json({ error: "Faça login." }, { status: 401 }) };
  }

  return { user };
}
