import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
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

    const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
    if (!publicUrl || !anonKey) {
      return NextResponse.json(
        { error: "Defina NEXT_PUBLIC_SUPABASE_ANON_KEY para autenticação da API." },
        { status: 503 }
      );
    }

    const cookieStore = await cookies();
    const authClient = createServerClient(publicUrl, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            /* ignore refresh cookie edge cases */
          }
        }
      }
    });

    const {
      data: { user }
    } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Faça login para gerenciar produtos." }, { status: 401 });
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
          depth: depthIn
        },
        has_customization: hasCustomization
      })
      .select("id")
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: productError?.message || "Could not create product." }, { status: 500 });
    }

    const uploaded: Array<{ path: string; sortOrder: number }> = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const extension = file.name.split(".").pop() || "jpg";
      const path = `${storeId}/${product.id}/${Date.now()}-${i}.${extension}`;
      const bytes = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage.from(storageBucket).upload(path, bytes, {
        contentType: file.type || "image/jpeg",
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

    return NextResponse.json({
      success: true,
      productId: product.id,
      localized
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
