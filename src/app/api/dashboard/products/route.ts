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

const getImagePreview = (path: string | null) => {
  if (!path) return null;
  const supabase = getSupabaseAdmin();
  return supabase.storage.from(storageBucket).getPublicUrl(path).data.publicUrl;
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
      return NextResponse.json({ error: error.message }, { status: 500 });
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

    const rows = (products ?? []).map((p) => {
      const meta = (p.dimensions_in as Record<string, unknown> | null) ?? {};
      const isOnline = meta.online === true;
      const title = (p.title as Record<string, string> | null)?.pt || (p.title as Record<string, string> | null)?.en || "Produto";
      return {
        id: p.id,
        title,
        priceUsd: p.price_usd,
        stockQty: Number(meta.stock_qty ?? 0),
        variantLabel: typeof meta.variant_label === "string" ? meta.variant_label : "",
        isOnline,
        createdAt: p.created_at,
        imageUrl: getImagePreview(imageMap.get(p.id) ?? null)
      };
    });

    return NextResponse.json({ products: rows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao listar produtos." },
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
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    const current = (existing.dimensions_in as Record<string, unknown> | null) ?? {};
    const dimensions = { ...current, online: isOnline };
    const { error: updateError } = await supabase.from("products").update({ dimensions_in: dimensions }).eq("id", productId);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar disponibilidade." },
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
    const storeId = formData.get("storeId")?.toString().trim();
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

    if (!storeId || !title || !description || !priceUsd || priceUsd <= 0) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const localized = await buildLocalizedProductText({
      originalLanguage,
      title,
      description
    });

    const supabase = getSupabaseAdmin();
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
        return NextResponse.json({ error: productError?.message || "Could not create product." }, { status: 500 });
      }

      productIds.push(product.id);
      const uploaded: Array<{ path: string; sortOrder: number }> = [];
      for (let i = 0; i < imageBuffers.length; i += 1) {
        const file = imageBuffers[i];
        const extension = file.name.split(".").pop() || "jpg";
        const path = `${storeId}/${product.id}/${Date.now()}-${batchIndex}-${i}.${extension}`;

        const { error: uploadError } = await supabase.storage.from(storageBucket).upload(path, file.bytes.slice(0), {
          contentType: file.type,
          upsert: false
        });

        if (uploadError) {
          return NextResponse.json({ error: uploadError.message }, { status: 500 });
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
          return NextResponse.json({ error: imageError.message }, { status: 500 });
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
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
