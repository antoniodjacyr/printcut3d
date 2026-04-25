import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/server/dashboard-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const runtime = "edge";
const avatarBucket = process.env.SUPABASE_AVATAR_BUCKET || "user-avatars";

async function uploadWithBucketRetry(params: {
  supabase: ReturnType<typeof getSupabaseAdmin>;
  path: string;
  bytes: ArrayBuffer;
  contentType: string;
}) {
  const { supabase, path, bytes, contentType } = params;
  let upload = await supabase.storage.from(avatarBucket).upload(path, bytes.slice(0), {
    contentType,
    upsert: true
  });

  if (upload.error && upload.error.message.toLowerCase().includes("bucket not found")) {
    const createResult = await supabase.storage.createBucket(avatarBucket, {
      public: true,
      fileSizeLimit: "5MB"
    });
    if (createResult.error && !createResult.error.message.toLowerCase().includes("already exists")) {
      return { error: createResult.error };
    }
    upload = await supabase.storage.from(avatarBucket).upload(path, bytes.slice(0), {
      contentType,
      upsert: true
    });
  }

  return upload;
}

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if ("response" in auth) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("avatar");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Envie um arquivo válido." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas imagens são permitidas." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const ext = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() || "jpg" : "jpg";
    const path = `${auth.user.id}/avatar.${ext}`;
    const bytes = await file.arrayBuffer();
    const upload = await uploadWithBucketRetry({
      supabase,
      path,
      bytes,
      contentType: file.type || "image/jpeg"
    });
    if (upload.error) {
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }

    const current = (auth.user.user_metadata || {}) as Record<string, unknown>;
    const { error: userError } = await supabase.auth.admin.updateUserById(auth.user.id, {
      user_metadata: {
        ...current,
        avatar_path: path
      }
    });
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    const signed = await supabase.storage.from(avatarBucket).createSignedUrl(path, 3600);
    const avatarUrl = signed.data?.signedUrl || supabase.storage.from(avatarBucket).getPublicUrl(path).data.publicUrl;
    return NextResponse.json({ success: true, avatarUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar foto de perfil." },
      { status: 500 }
    );
  }
}
