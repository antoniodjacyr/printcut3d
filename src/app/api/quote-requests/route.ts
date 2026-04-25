import { NextResponse } from "next/server";
import { getAuthenticatedUserOrNull } from "@/lib/server/dashboard-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const runtime = "edge";

type IncomingItem = {
  productId: string;
  quantity: number;
  customizationText?: string;
};

type IncomingPayload = {
  customer: {
    name: string;
    email: string;
    phone?: string;
    details?: string;
    paymentPreference?: string;
  };
  items: IncomingItem[];
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as IncomingPayload;
    const email = payload.customer?.email?.trim();
    const name = payload.customer?.name?.trim();
    const items = payload.items ?? [];
    if (!name || !email || items.length === 0) {
      return NextResponse.json({ error: "Dados do pedido incompletos." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const auth = await getAuthenticatedUserOrNull();
    if ("response" in auth) {
      return auth.response;
    }
    const userId = auth.user?.id ?? null;
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .insert({
        user_id: userId,
        email,
        last_activity_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (cartError || !cart) {
      return NextResponse.json({ error: cartError?.message || "Erro ao registrar pedido." }, { status: 500 });
    }

    const shared = {
      customer_name: name,
      customer_phone: payload.customer.phone?.trim() || "",
      customer_details: payload.customer.details?.trim() || "",
      payment_preference: payload.customer.paymentPreference || "to_be_defined",
      order_status: "received",
      seller_message: "Pedido recebido. Em breve enviaremos o valor total.",
      status_updated_at: new Date().toISOString()
    };

    const { error: itemsError } = await supabase.from("cart_items").insert(
      items.map((item) => ({
        cart_id: cart.id,
        product_id: item.productId,
        quantity: Math.max(1, Math.floor(item.quantity || 1)),
        customization_text: JSON.stringify({
          ...shared,
          item_notes: item.customizationText?.trim() || ""
        })
      }))
    );

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, requestId: cart.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao enviar pedido." },
      { status: 500 }
    );
  }
}
