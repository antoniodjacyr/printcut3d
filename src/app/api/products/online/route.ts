import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const runtime = "edge";

const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: products, error } = await supabase
      .from("products")
      .select("id, title, description, price_usd, dimensions_in")
      .order("created_at", { ascending: false })
      .limit(80);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const filtered = (products ?? []).filter((p) => {
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

    return NextResponse.json({
      products: filtered.map((p) => {
        const title = (p.title as Record<string, string> | null) ?? {};
        const description = (p.description as Record<string, string> | null) ?? {};
        const path = imageMap.get(p.id);
        return {
          id: p.id,
          title,
          description,
          priceUsd: p.price_usd,
          imageUrl: path ? supabase.storage.from(storageBucket).getPublicUrl(path).data.publicUrl : null
        };
      })
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao carregar catálogo online." },
      { status: 500 }
    );
  }
}
