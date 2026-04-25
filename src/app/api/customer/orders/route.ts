import { NextResponse } from "next/server";
import { requireDashboardUser } from "@/lib/server/dashboard-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const runtime = "edge";

type ParsedMeta = {
  customer_name?: string;
  customer_phone?: string;
  customer_details?: string;
  payment_preference?: string;
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

export async function GET() {
  const auth = await requireDashboardUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const supabase = getSupabaseAdmin();
    const email = (auth.user.email || "").toLowerCase();

    const query = supabase
      .from("carts")
      .select("id, email, user_id, created_at, cart_items(quantity, customization_text, products(title, price_usd))")
      .order("created_at", { ascending: false })
      .limit(60);

    const { data, error } = email
      ? await query.or(`user_id.eq.${auth.user.id},email.eq.${email}`)
      : await query.eq("user_id", auth.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []).map((cart) => {
      const items = (cart.cart_items as Array<Record<string, unknown>>) ?? [];
      const meta = parseMeta((items[0]?.customization_text as string | null) ?? null);
      const subtotal = items.reduce((sum, item) => {
        const qty = Number(item.quantity ?? 0);
        const product = (item.products as Record<string, unknown>) ?? {};
        return sum + qty * Number(product.price_usd ?? 0);
      }, 0);

      return {
        id: cart.id,
        createdAt: cart.created_at,
        customerName: meta.customer_name || auth.user.email || "Cliente",
        customerPhone: meta.customer_phone || "",
        customerDetails: meta.customer_details || "",
        paymentPreference: meta.payment_preference || "to_be_defined",
        orderStatus: meta.order_status || "received",
        sellerMessage: meta.seller_message || "Pedido recebido. Aguarde novidades.",
        statusUpdatedAt: meta.status_updated_at || cart.created_at,
        estimatedSubtotalUsd: Number(subtotal.toFixed(2)),
        totalItems: items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0),
        items: items.map((item) => {
          const product = (item.products as Record<string, unknown>) ?? {};
          const titleObj = (product.title as Record<string, string> | undefined) ?? {};
          const itemMeta = parseMeta((item.customization_text as string | null) ?? null);
          return {
            title: titleObj.pt || titleObj.en || "Produto",
            quantity: Number(item.quantity ?? 1),
            unitPriceUsd: Number(product.price_usd ?? 0),
            notes: itemMeta.item_notes || ""
          };
        })
      };
    });

    return NextResponse.json({
      profile: {
        email: auth.user.email || "",
        name: rows[0]?.customerName || "",
        phone: rows[0]?.customerPhone || ""
      },
      orders: rows
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao carregar pedidos do cliente." },
      { status: 500 }
    );
  }
}
