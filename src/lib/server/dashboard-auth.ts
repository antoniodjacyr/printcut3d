import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { SupabaseCookieToSet } from "@/lib/supabase/cookie-types";
import { sanitizeSupabaseKey, sanitizeSupabaseUrl } from "@/lib/supabase/env-sanitize";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

async function createAuthClient():
  Promise<{ client: SupabaseClient; errorResponse?: NextResponse }> {
  const publicUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = sanitizeSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!publicUrl || !anonKey) {
    return {
      // caller can return this as-is
      errorResponse: NextResponse.json({ error: "Auth não configurado (NEXT_PUBLIC_SUPABASE_ANON_KEY)." }, { status: 503 }),
      client: {} as SupabaseClient
    };
  }

  const cookieStore = await cookies();
  const client = createServerClient(publicUrl, anonKey, {
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

  return { client };
}

export async function requireDashboardUser(): Promise<{ user: User } | { response: NextResponse }> {
  const auth = await requireAuthenticatedUser();
  if ("response" in auth) {
    return auth;
  }
  const isAdmin = await isUserAdmin(auth.user);
  if (!isAdmin) {
    return { response: NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 }) };
  }
  return { user: auth.user };
}

export async function requireAuthenticatedUser(): Promise<{ user: User } | { response: NextResponse }> {
  const { client, errorResponse } = await createAuthClient();
  if (errorResponse) {
    return { response: errorResponse };
  }

  const {
    data: { user }
  } = await client.auth.getUser();
  if (!user) {
    return { response: NextResponse.json({ error: "Faça login." }, { status: 401 }) };
  }

  return { user };
}

function hasAdminMetadata(user: User): boolean {
  const meta = (user.user_metadata || {}) as Record<string, unknown>;
  const appMeta = (user.app_metadata || {}) as Record<string, unknown>;
  return (
    meta.is_admin === true ||
    meta.isAdmin === true ||
    meta.role === "admin" ||
    appMeta.role === "admin" ||
    appMeta.is_admin === true
  );
}

export async function isUserAdmin(user: User): Promise<boolean> {
  if (hasAdminMetadata(user)) {
    return true;
  }
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (error) {
      return false;
    }
    return Boolean(data?.id);
  } catch {
    return false;
  }
}

export async function getAuthenticatedUserOrNull(): Promise<{ user: User | null } | { response: NextResponse }> {
  const { client, errorResponse } = await createAuthClient();
  if (errorResponse) {
    return { response: errorResponse };
  }
  const {
    data: { user }
  } = await client.auth.getUser();
  return { user };
}
