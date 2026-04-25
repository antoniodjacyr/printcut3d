import { NextResponse } from "next/server";
import { requireDashboardUser } from "@/lib/server/dashboard-auth";
import { buildLocalizedProductText } from "@/lib/server/product-language";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const runtime = "edge";

const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

const parseBoolean = (value: FormDataEntryValue | null) => value === "true";
const parseNumber = (value: FormDataEntryValue | null) => {
  if (!value) return null;
  const num = Number(value.toString());
  return Number.isFinite(num) ? num : null;
};

async function uploadWithBucketRetry(params: {
  supabase: ReturnType<typeof getSupabaseAdmin>;
  path: string;
  bytes: ArrayBuffer;
  contentType: string;
}) {
  const { supabase, path, bytes, contentType } = params;
  let upload = await supabase.storage.from(storageBucket).upload(path, bytes.slice(0), {
    contentType,
    upsert: false
  });

  if (upload.error && upload.error.message.toLowerCase().includes("bucket not found")) {
    const createResult = await supabase.storage.createBucket(storageBucket, {
      public: true,
      fileSizeLimit: "10MB"
    });
    if (createResult.error && !createResult.error.message.toLowerCase().includes("already exists")) {
      return { error: createResult.error };
    }

    upload = await supabase.storage.from(storageBucket).upload(path, bytes.slice(0), {
      contentType,
      upsert: false
    });
  }

  return upload;
}

function mapSchemaError(message: string) {
  const lower = message.toLowerCase();
  if (
    lower.includes("could not find the table 'public.products'") ||
    lower.includes("relation \"public.products\" does not exist") ||
    lower.includes("relation \"products\" does not exist")
  ) {
    return "Tabela public.products não encontrada no Supabase. Execute o SQL base (supabase/schema.sql) no SQL Editor e recarregue.";
  }
  if (
    lower.includes("could not find the table 'public.product_images'") ||
    lower.includes("relation \"public.product_images\" does not exist")
  ) {
    return "Tabela public.product_images não encontrada. Execute o SQL base (supabase/schema.sql) no SQL Editor.";
  }
  return message;
}

const getImagePreview = async (path: string | null) => {
  if (!path) return null;
  const supabase = getSupabaseAdmin();
  const signed = await supabase.storage.from(storageBucket).createSignedUrl(path, 3600);
  return signed.data?.signedUrl || supabase.storage.from(storageBucket).getPublicUrl(path).data.publicUrl;
};

export async function GET() {
  const auth = await requireDashboardUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: products, error } = await supabase
      .from("products")
      .select("id, title, price_usd, dimensions_in, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: mapSchemaError(error.message) }, { status: 500 });
    }

    const productIds = (products ?? []).map((p) => p.id);
    let imageMap = new Map<string, string>();
    if (productIds.length > 0) {
      const { data: images } = await supabase
        .from("product_images")
        .select("product_id, storage_path, sort_order")
        .in("product_id", productIds)
        .order("sort_order", { ascending: true });

      imageMap = new Map<string, string>();
      (images ?? []).forEach((img) => {
        if (!imageMap.has(img.product_id)) {
          imageMap.set(img.product_id, img.storage_path);
        }
      });
    }

    const rows = await Promise.all(
      (products ?? []).map(async (p) => {
        const meta = (p.dimensions_in as Record<string, unknown> | null) ?? {};
        const isOnline = meta.online === true;
        const title =
          (p.title as Record<string, string> | null)?.pt || (p.title as Record<string, string> | null)?.en || "Produto";
        return {
          id: p.id,
          title,
          priceUsd: p.price_usd,
          stockQty: Number(meta.stock_qty ?? 0),
          variantLabel: typeof meta.variant_label === "string" ? meta.variant_label : "",
          isOnline,
          createdAt: p.created_at,
          imageUrl: await getImagePreview(imageMap.get(p.id) ?? null)
        };
      })
    );

    return NextResponse.json({ products: rows });
  } catch (error) {
      return NextResponse.json(
        { error: mapSchemaError(error instanceof Error ? error.message : "Erro ao listar produtos.") },
        { status: 500 }
      );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireDashboardUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const { productId, isOnline } = (await request.json()) as { productId?: string; isOnline?: boolean };
    if (!productId || typeof isOnline !== "boolean") {
      return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: existing, error: readError } = await supabase
      .from("products")
      .select("dimensions_in")
      .eq("id", productId)
      .single();

    if (readError || !existing) {
      const msg = readError ? mapSchemaError(readError.message) : "Produto não encontrado.";
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    const current = (existing.dimensions_in as Record<string, unknown> | null) ?? {};
    const dimensions = { ...current, online: isOnline };
    const { error: updateError } = await supabase.from("products").update({ dimensions_in: dimensions }).eq("id", productId);
    if (updateError) {
      return NextResponse.json({ error: mapSchemaError(updateError.message) }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: mapSchemaError(error instanceof Error ? error.message : "Erro ao atualizar disponibilidade.") },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
    const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
    if (!rawUrl || !rawKey) {
      return NextResponse.json(
        {
          error:
            "Supabase não configurado no servidor. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis do Cloudflare Pages."
        },
        { status: 503 }
      );
    }

    const auth = await requireDashboardUser();
    if ("response" in auth) {
      return auth.response;
    }

    const formData = await request.formData();
    const requestedStoreId = formData.get("storeId")?.toString().trim();
    const originalLanguage = formData.get("originalLanguage")?.toString().trim() || "en";
    const title = formData.get("title")?.toString().trim() || "";
    const description = formData.get("description")?.toString().trim() || "";
    const priceUsd = parseNumber(formData.get("priceUsd"));
    const weightLbs = parseNumber(formData.get("weightLbs"));
    const widthIn = parseNumber(formData.get("widthIn"));
    const heightIn = parseNumber(formData.get("heightIn"));
    const depthIn = parseNumber(formData.get("depthIn"));
    const stockQty = parseNumber(formData.get("stockQty"));
    const batchCount = Math.max(1, Math.min(25, Math.floor(parseNumber(formData.get("batchCount")) ?? 1)));
    const isOnline = parseBoolean(formData.get("isOnline"));
    const variantLabel = formData.get("variantLabel")?.toString().trim() || null;
    const seoTagsRaw = formData.get("seoTags")?.toString().trim() || "";
    const seoTags = seoTagsRaw
      ? seoTagsRaw
          .split(/[,;]+/)
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];
    const hasCustomization = parseBoolean(formData.get("hasCustomization"));
    const files = formData.getAll("images").filter((entry) => entry instanceof File) as File[];

    if (!title || !description || !priceUsd || priceUsd <= 0) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const localized = await buildLocalizedProductText({
      originalLanguage,
      title,
      description
    });

    const supabase = getSupabaseAdmin();
    let storeId = requestedStoreId || "";
    if (storeId) {
      const { data: storeCheck, error: storeCheckError } = await supabase
        .from("stores")
        .select("id")
        .eq("id", storeId)
        .single();
      if (storeCheckError || !storeCheck) {
        storeId = "";
      }
    }

    if (!storeId) {
      const { data: ownedStore, error: ownedStoreError } = await supabase
        .from("stores")
        .select("id")
        .eq("owner_user_id", auth.user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!ownedStoreError && ownedStore?.id) {
        storeId = ownedStore.id;
      } else {
        const fallbackStoreId = requestedStoreId || crypto.randomUUID();
        const { data: createdStore, error: createStoreError } = await supabase
          .from("stores")
          .insert({
            id: fallbackStoreId,
            owner_user_id: auth.user.id,
            name: "Minha Loja",
            is_admin_store: true
          })
          .select("id")
          .single();

        if (createStoreError || !createdStore) {
          return NextResponse.json(
            {
              error: mapSchemaError(createStoreError?.message || "Falha ao criar loja para vincular o produto.")
            },
            { status: 500 }
          );
        }
        storeId = createdStore.id;
      }
    }

    const productIds: string[] = [];
    const imageBuffers = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type || "image/jpeg",
        bytes: await file.arrayBuffer()
      }))
    );

    for (let batchIndex = 0; batchIndex < batchCount; batchIndex += 1) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          store_id: storeId,
          title: localized.title,
          description: localized.description,
          price_usd: priceUsd,
          weight_lbs: weightLbs,
          dimensions_in: {
            width: widthIn,
            height: heightIn,
            depth: depthIn,
            stock_qty: stockQty,
            variant_label: variantLabel,
            seo_tags: seoTags,
            online: isOnline
          },
          has_customization: hasCustomization
        })
        .select("id")
        .single();

      if (productError || !product) {
        return NextResponse.json(
          { error: mapSchemaError(productError?.message || "Could not create product.") },
          { status: 500 }
        );
      }

      productIds.push(product.id);
      const uploaded: Array<{ path: string; sortOrder: number }> = [];
      for (let i = 0; i < imageBuffers.length; i += 1) {
        const file = imageBuffers[i];
        const extension = file.name.split(".").pop() || "jpg";
        const path = `${storeId}/${product.id}/${Date.now()}-${batchIndex}-${i}.${extension}`;

        const { error: uploadError } = await uploadWithBucketRetry({
          supabase,
          path,
          bytes: file.bytes,
          contentType: file.type
        });

        if (uploadError) {
          return NextResponse.json({ error: mapSchemaError(uploadError.message) }, { status: 500 });
        }

        uploaded.push({ path, sortOrder: i });
      }

      if (uploaded.length > 0) {
        const { error: imageError } = await supabase.from("product_images").insert(
          uploaded.map((file) => ({
            product_id: product.id,
            storage_path: file.path,
            sort_order: file.sortOrder
          }))
        );

        if (imageError) {
          return NextResponse.json({ error: mapSchemaError(imageError.message) }, { status: 500 });
        }
      }
    }

    return NextResponse.json({
      success: true,
      productId: productIds[0],
      productIds,
      createdCount: productIds.length,
      localized
    });
  } catch (error) {
    const message = mapSchemaError(error instanceof Error ? error.message : "Unexpected error.");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
