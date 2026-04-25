import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const runtime = "edge";

const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: productsData, error } = await supabase
      .from("products")
      .select("id, title, description, price_usd, weight_lbs, dimensions_in, has_customization")
      .order("created_at", { ascending: false })
      .limit(80);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const filtered = (productsData ?? []).filter((p) => {
      const meta = (p.dimensions_in as Record<string, unknown> | null) ?? {};
      return meta.online === true;
    });

    const ids = filtered.map((p) => p.id);
    let imageMap = new Map<string, string>();
    if (ids.length > 0) {
      const { data: images } = await supabase
        .from("product_images")
        .select("product_id, storage_path, sort_order")
        .in("product_id", ids)
        .order("sort_order", { ascending: true });

      (images ?? []).forEach((img) => {
        if (!imageMap.has(img.product_id)) {
          imageMap.set(img.product_id, img.storage_path);
        }
      });
    }

    const products = await Promise.all(
      filtered.map(async (p) => {
        const title = (p.title as Record<string, string> | null) ?? {};
        const description = (p.description as Record<string, string> | null) ?? {};
        const dimensions = (p.dimensions_in as Record<string, unknown> | null) ?? {};
        const path = imageMap.get(p.id);
        let imageUrl: string | null = null;
        if (path) {
          const signed = await supabase.storage.from(storageBucket).createSignedUrl(path, 3600);
          imageUrl = signed.data?.signedUrl || supabase.storage.from(storageBucket).getPublicUrl(path).data.publicUrl;
        }
        return {
          id: p.id,
          title,
          description,
          priceUsd: p.price_usd,
          imageUrl,
          weightLbs: Number(p.weight_lbs ?? 0),
          hasCustomization: Boolean(p.has_customization),
          dimensionsIn: {
            width: Number(dimensions.width ?? 0),
            height: Number(dimensions.height ?? 0),
            depth: Number(dimensions.depth ?? 0)
          },
          stockQty: Number(dimensions.stock_qty ?? 0),
          variantLabel: typeof dimensions.variant_label === "string" ? dimensions.variant_label : "",
          seoTags: Array.isArray(dimensions.seo_tags) ? dimensions.seo_tags : []
        };
      })
    );

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao carregar catálogo online." },
      { status: 500 }
    );
  }
}
