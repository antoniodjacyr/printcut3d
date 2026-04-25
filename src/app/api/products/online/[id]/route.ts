import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const runtime = "edge";

const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = getSupabaseAdmin();
    const { data: product, error } = await supabase
      .from("products")
      .select("id, title, description, price_usd, weight_lbs, dimensions_in, has_customization")
      .eq("id", id)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    const dimensions = (product.dimensions_in as Record<string, unknown> | null) ?? {};
    if (dimensions.online !== true) {
      return NextResponse.json({ error: "Produto não está disponível online." }, { status: 404 });
    }

    const { data: images } = await supabase
      .from("product_images")
      .select("storage_path, sort_order")
      .eq("product_id", id)
      .order("sort_order", { ascending: true })
      .limit(1);

    const path = images?.[0]?.storage_path;
    let imageUrl: string | null = null;
    if (path) {
      const signed = await supabase.storage.from(storageBucket).createSignedUrl(path, 3600);
      imageUrl = signed.data?.signedUrl || supabase.storage.from(storageBucket).getPublicUrl(path).data.publicUrl;
    }

    return NextResponse.json({
      product: {
        id: product.id,
        title: (product.title as Record<string, string> | null) ?? {},
        description: (product.description as Record<string, string> | null) ?? {},
        priceUsd: product.price_usd,
        imageUrl,
        weightLbs: Number(product.weight_lbs ?? 0),
        hasCustomization: Boolean(product.has_customization),
        dimensionsIn: {
          width: Number(dimensions.width ?? 0),
          height: Number(dimensions.height ?? 0),
          depth: Number(dimensions.depth ?? 0)
        },
        stockQty: Number(dimensions.stock_qty ?? 0),
        variantLabel: typeof dimensions.variant_label === "string" ? dimensions.variant_label : "",
        seoTags: Array.isArray(dimensions.seo_tags) ? dimensions.seo_tags : []
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao carregar produto." },
      { status: 500 }
    );
  }
}
