import { NextResponse } from "next/server";
import { requireDashboardUser } from "@/lib/server/dashboard-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const runtime = "edge";

type AdminUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  banned_until?: string | null;
  created_at?: string;
  last_sign_in_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
};

type AuditLogRow = {
  id: string;
  created_at: string;
  actor_user_id: string;
  actor_email: string;
  target_user_id: string;
  target_email: string;
  action: string;
  details: Record<string, unknown> | null;
};

function toUserRow(user: AdminUser) {
  const meta = (user.user_metadata || {}) as Record<string, unknown>;
  const appMeta = (user.app_metadata || {}) as Record<string, unknown>;
  const fullName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim() ||
    "";
  const role =
    appMeta.role === "admin" || appMeta.is_admin === true || meta.role === "admin" ? "admin" : "customer";
  return {
    id: user.id,
    email: user.email || "",
    fullName,
    phone: (typeof meta.phone === "string" && meta.phone) || "",
    country: (typeof meta.country === "string" && meta.country) || "",
    city: (typeof meta.city === "string" && meta.city) || "",
    state: (typeof meta.state === "string" && meta.state) || "",
    zip: (typeof meta.zip === "string" && meta.zip) || "",
    role,
    emailConfirmed: Boolean(user.email_confirmed_at),
    blocked: Boolean(user.banned_until),
    createdAt: user.created_at || "",
    lastSignInAt: user.last_sign_in_at || ""
  };
}

async function logAudit(params: {
  actorUserId: string;
  actorEmail: string;
  targetUserId: string;
  targetEmail: string;
  action: string;
  details?: Record<string, unknown>;
}) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("admin_audit_logs").insert({
      actor_user_id: params.actorUserId,
      actor_email: params.actorEmail,
      target_user_id: params.targetUserId,
      target_email: params.targetEmail,
      action: params.action,
      details: params.details || {}
    });
  } catch {
    /* ignore audit logging failures */
  }
}

export async function GET(request: Request) {
  const auth = await requireDashboardUser();
  if ("response" in auth) return auth.response;

  try {
    const url = new URL(request.url);
    const query = (url.searchParams.get("q") || "").trim().toLowerCase();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const users = ((data?.users || []) as AdminUser[]).map(toUserRow);
    const filtered = query
      ? users.filter(
          (u) =>
            u.email.toLowerCase().includes(query) ||
            u.fullName.toLowerCase().includes(query) ||
            u.phone.toLowerCase().includes(query)
        )
      : users;
    let logs: Array<{
      id: string;
      createdAt: string;
      actorEmail: string;
      targetEmail: string;
      action: string;
      details: Record<string, unknown>;
    }> = [];
    const logsResult = await supabase
      .from("admin_audit_logs")
      .select("id, created_at, actor_email, target_email, action, details")
      .order("created_at", { ascending: false })
      .limit(80);
    if (!logsResult.error && logsResult.data) {
      logs = (logsResult.data as AuditLogRow[]).map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        actorEmail: row.actor_email,
        targetEmail: row.target_email,
        action: row.action,
        details: (row.details || {}) as Record<string, unknown>
      }));
    }

    return NextResponse.json({ users: filtered, logs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao carregar usuários." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireDashboardUser();
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as {
      userId?: string;
      fullName?: string;
      phone?: string;
      country?: string;
      city?: string;
      state?: string;
      zip?: string;
      role?: "admin" | "customer";
      emailConfirmed?: boolean;
      blocked?: boolean;
    };
    const userId = body.userId?.trim();
    if (!userId) return NextResponse.json({ error: "Informe userId." }, { status: 400 });
    if (userId === auth.user.id && body.role === "customer") {
      return NextResponse.json({ error: "Você não pode remover seu próprio acesso de admin." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: found, error: readError } = await supabase.auth.admin.getUserById(userId);
    if (readError || !found?.user) {
      return NextResponse.json({ error: readError?.message || "Usuário não encontrado." }, { status: 404 });
    }
    const currentMeta = ((found.user.user_metadata as Record<string, unknown> | undefined) || {}) as Record<
      string,
      unknown
    >;
    const nextMeta = {
      ...currentMeta,
      full_name: (body.fullName ?? (currentMeta.full_name as string) ?? "").toString().trim(),
      phone: (body.phone ?? (currentMeta.phone as string) ?? "").toString().trim(),
      country: (body.country ?? (currentMeta.country as string) ?? "").toString().trim(),
      city: (body.city ?? (currentMeta.city as string) ?? "").toString().trim(),
      state: (body.state ?? (currentMeta.state as string) ?? "").toString().trim(),
      zip: (body.zip ?? (currentMeta.zip as string) ?? "").toString().trim()
    };
    const role = body.role === "admin" ? "admin" : "customer";
    const nextAppMeta = {
      ...(found.user.app_metadata || {}),
      role,
      is_admin: role === "admin"
    };

    const payload: Record<string, unknown> = {
      user_metadata: nextMeta,
      app_metadata: nextAppMeta
    };
    if (typeof body.emailConfirmed === "boolean") payload.email_confirm = body.emailConfirmed;
    if (typeof body.blocked === "boolean") payload.ban_duration = body.blocked ? "876000h" : "none";

    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, payload);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    await logAudit({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email || "",
      targetUserId: userId,
      targetEmail: found.user.email || "",
      action: "update_user",
      details: { role, emailConfirmed: body.emailConfirmed, blocked: body.blocked }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar usuário." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireDashboardUser();
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as { userId?: string; action?: "reset_password" | "delete_user" };
    const userId = body.userId?.trim();
    const action = body.action;
    if (!userId || !action) {
      return NextResponse.json({ error: "Informe userId e action." }, { status: 400 });
    }
    if (userId === auth.user.id && action === "delete_user") {
      return NextResponse.json({ error: "Você não pode excluir seu próprio usuário admin." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: found, error: readError } = await supabase.auth.admin.getUserById(userId);
    if (readError || !found?.user) {
      return NextResponse.json({ error: readError?.message || "Usuário não encontrado." }, { status: 404 });
    }
    const targetEmail = found.user.email || "";

    if (action === "reset_password") {
      if (!targetEmail) return NextResponse.json({ error: "Usuário sem e-mail." }, { status: 400 });
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: targetEmail
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await logAudit({
        actorUserId: auth.user.id,
        actorEmail: auth.user.email || "",
        targetUserId: userId,
        targetEmail,
        action: "reset_password_link"
      });
      return NextResponse.json({ success: true, recoveryLink: data.properties?.action_link || "" });
    }

    if (action === "delete_user") {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await logAudit({
        actorUserId: auth.user.id,
        actorEmail: auth.user.email || "",
        targetUserId: userId,
        targetEmail,
        action: "delete_user"
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao executar ação administrativa." },
      { status: 500 }
    );
  }
}
