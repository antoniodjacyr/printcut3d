import { NextResponse } from "next/server";
import { requireDashboardUser } from "@/lib/server/dashboard-auth";
import { buildLocalizedProductText } from "@/lib/server/product-language";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const runtime = "edge";

const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

const parseNumber = (value: FormDataEntryValue | null) => {
  if (!value) return null;
  const num = Number(value.toString());
  return Number.isFinite(num) ? num : null;
};

const parseBool = (value: FormDataEntryValue | null) => value === "true";

async function uploadImage(supabase: ReturnType<typeof getSupabaseAdmin>, path: string, file: File) {
  const bytes = await file.arrayBuffer();
  let upload = await supabase.storage.from(storageBucket).upload(path, bytes.slice(0), {
    contentType: file.type || "image/jpeg",
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
      contentType: file.type || "image/jpeg",
      upsert: false
    });
  }

  return upload;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireDashboardUser();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  try {
    const supabase = getSupabaseAdmin();
    const { data: product, error } = await supabase
      .from("products")
      .select("id, title, description, price_usd, weight_lbs, dimensions_in, has_customization")
      .eq("id", id)
      .single();
    if (error || !product) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    const { data: images } = await supabase
      .from("product_images")
      .select("storage_path, sort_order")
      .eq("product_id", id)
      .order("sort_order", { ascending: true });

    const firstPath = images?.[0]?.storage_path || null;
    let imageUrl: string | null = null;
    if (firstPath) {
      const signed = await supabase.storage.from(storageBucket).createSignedUrl(firstPath, 3600);
      imageUrl = signed.data?.signedUrl || supabase.storage.from(storageBucket).getPublicUrl(firstPath).data.publicUrl;
    }

    const dimensions = (product.dimensions_in as Record<string, unknown> | null) ?? {};
    return NextResponse.json({
      product: {
        id: product.id,
        title: (product.title as Record<string, string> | null) ?? {},
        description: (product.description as Record<string, string> | null) ?? {},
        priceUsd: Number(product.price_usd ?? 0),
        weightLbs: Number(product.weight_lbs ?? 0),
        widthIn: Number(dimensions.width ?? 0),
        heightIn: Number(dimensions.height ?? 0),
        depthIn: Number(dimensions.depth ?? 0),
        stockQty: Number(dimensions.stock_qty ?? 0),
        variantLabel: typeof dimensions.variant_label === "string" ? dimensions.variant_label : "",
        seoTags: Array.isArray(dimensions.seo_tags) ? dimensions.seo_tags : [],
        isOnline: dimensions.online === true,
        hasCustomization: Boolean(product.has_customization),
        imageUrl
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao carregar produto." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireDashboardUser();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  try {
    const formData = await request.formData();
    const originalLanguage = formData.get("originalLanguage")?.toString().trim() || "pt";
    const title = formData.get("title")?.toString().trim() || "";
    const description = formData.get("description")?.toString().trim() || "";
    const priceUsd = parseNumber(formData.get("priceUsd"));
    const weightLbs = parseNumber(formData.get("weightLbs"));
    const widthIn = parseNumber(formData.get("widthIn"));
    const heightIn = parseNumber(formData.get("heightIn"));
    const depthIn = parseNumber(formData.get("depthIn"));
    const stockQty = parseNumber(formData.get("stockQty"));
    const variantLabel = formData.get("variantLabel")?.toString().trim() || "";
    const seoTagsRaw = formData.get("seoTags")?.toString().trim() || "";
    const seoTags = seoTagsRaw
      ? seoTagsRaw
          .split(/[,;]+/)
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];
    const isOnline = parseBool(formData.get("isOnline"));
    const hasCustomization = parseBool(formData.get("hasCustomization"));
    const replaceImages = parseBool(formData.get("replaceImages"));
    const files = formData.getAll("images").filter((entry) => entry instanceof File) as File[];

    if (!title || !description || !priceUsd || priceUsd <= 0) {
      return NextResponse.json({ error: "Título, descrição e preço são obrigatórios." }, { status: 400 });
    }

    const localized = await buildLocalizedProductText({ originalLanguage, title, description });
    const supabase = getSupabaseAdmin();
    const { data: current, error: readError } = await supabase
      .from("products")
      .select("dimensions_in, store_id")
      .eq("id", id)
      .single();
    if (readError || !current) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    const dimensions = {
      ...((current.dimensions_in as Record<string, unknown> | null) ?? {}),
      width: widthIn,
      height: heightIn,
      depth: depthIn,
      stock_qty: stockQty,
      variant_label: variantLabel,
      seo_tags: seoTags,
      online: isOnline
    };

    const { error: updateError } = await supabase
      .from("products")
      .update({
        title: localized.title,
        description: localized.description,
        price_usd: priceUsd,
        weight_lbs: weightLbs,
        dimensions_in: dimensions,
        has_customization: hasCustomization
      })
      .eq("id", id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (replaceImages && files.length > 0) {
      await supabase.from("product_images").delete().eq("product_id", id);
    }
    if (files.length > 0) {
      const uploaded: Array<{ path: string; sortOrder: number }> = [];
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const extension = file.name.split(".").pop() || "jpg";
        const path = `${current.store_id}/${id}/${Date.now()}-edit-${i}.${extension}`;
        const { error: uploadError } = await uploadImage(supabase, path, file);
        if (uploadError) {
          return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }
        uploaded.push({ path, sortOrder: i });
      }
      if (uploaded.length > 0) {
        const { error: imageError } = await supabase.from("product_images").insert(
          uploaded.map((item) => ({
            product_id: id,
            storage_path: item.path,
            sort_order: item.sortOrder
          }))
        );
        if (imageError) {
          return NextResponse.json({ error: imageError.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar produto." },
      { status: 500 }
    );
  }
}
