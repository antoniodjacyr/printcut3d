import { NextResponse } from "next/server";
import { requireDashboardUser } from "@/lib/server/dashboard-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const runtime = "edge";

const avatarBucket = "avatars";

async function ensureAvatarBucket(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const create = await supabase.storage.createBucket(avatarBucket, {
    public: true,
    fileSizeLimit: "5MB"
  });
  if (create.error && !create.error.message.toLowerCase().includes("already exists")) {
    return create.error;
  }
  return null;
}

export async function POST(request: Request) {
  const auth = await requireDashboardUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("avatar");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Envie uma imagem no campo avatar." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const bucketError = await ensureAvatarBucket(supabase);
    if (bucketError) {
      return NextResponse.json({ error: bucketError.message }, { status: 500 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${auth.user.id}/${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage.from(avatarBucket).upload(path, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: true
    });
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const publicUrl = supabase.storage.from(avatarBucket).getPublicUrl(path).data.publicUrl;
    const currentMeta = (auth.user.user_metadata || {}) as Record<string, unknown>;
    const { error: authError } = await supabase.auth.admin.updateUserById(auth.user.id, {
      user_metadata: {
        ...currentMeta,
        avatar_url: publicUrl
      }
    });
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, avatarUrl: publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar foto." },
      { status: 500 }
    );
  }
}
