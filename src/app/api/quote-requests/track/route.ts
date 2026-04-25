import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const runtime = "edge";

type ParsedMeta = {
  customer_name?: string;
  customer_phone?: string;
  customer_details?: string;
  payment_preference?: string;
  payment_status?: string;
  item_notes?: string;
  order_status?: string;
  seller_message?: string;
  status_updated_at?: string;
};

const parseMeta = (value: string | null): ParsedMeta => {
  if (!value) return {};
  try {
    return JSON.parse(value) as ParsedMeta;
  } catch {
    return {};
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId")?.trim() || "";
    const email = searchParams.get("email")?.trim().toLowerCase() || "";
    if (!requestId || !email) {
      return NextResponse.json({ error: "Informe requestId e email." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id, email, created_at, cart_items(quantity, customization_text, products(title, price_usd))")
      .eq("id", requestId)
      .single();

    if (cartError || !cart) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }
    if ((cart.email || "").toLowerCase() !== email) {
      return NextResponse.json({ error: "E-mail não corresponde ao pedido." }, { status: 403 });
    }

    const items = (cart.cart_items as Array<Record<string, unknown>>) ?? [];
    const meta = parseMeta((items[0]?.customization_text as string | null) ?? null);
    const subtotal = items.reduce((sum, item) => {
      const qty = Number(item.quantity ?? 0);
      const product = (item.products as Record<string, unknown>) ?? {};
      return sum + qty * Number(product.price_usd ?? 0);
    }, 0);

    return NextResponse.json({
      request: {
        id: cart.id,
        createdAt: cart.created_at,
        status: meta.order_status || "received",
        paymentStatus: meta.payment_status || "pending",
        sellerMessage: meta.seller_message || "Pedido recebido.",
        statusUpdatedAt: meta.status_updated_at || cart.created_at,
        subtotalEstimatedUsd: Number(subtotal.toFixed(2)),
        items: items.map((item) => {
          const product = (item.products as Record<string, unknown>) ?? {};
          const titleObj = (product.title as Record<string, string> | undefined) ?? {};
          const details = parseMeta((item.customization_text as string | null) ?? null);
          return {
            title: titleObj.pt || titleObj.en || "Produto",
            quantity: Number(item.quantity ?? 1),
            unitPriceUsd: Number(product.price_usd ?? 0),
            notes: details.item_notes || ""
          };
        })
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao acompanhar pedido." },
      { status: 500 }
    );
  }
}
