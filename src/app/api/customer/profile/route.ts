import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/server/dashboard-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const runtime = "edge";

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if ("response" in auth) return auth.response;
  const meta = (auth.user.user_metadata || {}) as Record<string, unknown>;
  return NextResponse.json({
    profile: {
      name: (meta.full_name as string) || "",
      email: auth.user.email || "",
      phone: (meta.phone as string) || "",
      addressLine1: (meta.address_line1 as string) || "",
      addressLine2: (meta.address_line2 as string) || "",
      city: (meta.city as string) || "",
      state: (meta.state as string) || "",
      zip: (meta.zip as string) || "",
      country: (meta.country as string) || "USA"
    }
  });
}

export async function PATCH(request: Request) {
  const auth = await requireAuthenticatedUser();
  if ("response" in auth) return auth.response;
  try {
    const body = (await request.json()) as Record<string, string>;
    const supabase = getSupabaseAdmin();
    const current = (auth.user.user_metadata || {}) as Record<string, unknown>;
    const fullName = body.name?.trim() || (current.full_name as string) || "";
    const nextMeta = {
      ...current,
      full_name: fullName,
      phone: body.phone?.trim() || "",
      address_line1: body.addressLine1?.trim() || "",
      address_line2: body.addressLine2?.trim() || "",
      city: body.city?.trim() || "",
      state: body.state?.trim() || "",
      zip: body.zip?.trim() || "",
      country: body.country?.trim() || "USA"
    };
    const { error } = await supabase.auth.admin.updateUserById(auth.user.id, { user_metadata: nextMeta });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar perfil." },
      { status: 500 }
    );
  }
}
