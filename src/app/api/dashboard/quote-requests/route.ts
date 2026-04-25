import { NextResponse } from "next/server";
import { requireDashboardUser } from "@/lib/server/dashboard-auth";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const runtime = "edge";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://printcut3d.com";

async function sendOrderUpdateEmail(params: {
  to: string;
  requestId: string;
  orderStatus: string;
  paymentStatus: string;
  sellerMessage: string;
}) {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) return { sent: false as const, reason: "missing_api_key" as const };

  const from = (process.env.ORDER_UPDATES_FROM_EMAIL || "Print & Cut 3D <onboarding@resend.dev>").trim();
  const subject = `Atualizacao do pedido ${params.requestId.slice(0, 8)} - ${params.orderStatus}`;
  const trackUrl = `${siteUrl.replace(/\/+$/, "")}/track-order`;
  const text = [
    "Seu pedido foi atualizado.",
    "",
    `Pedido: ${params.requestId}`,
    `Status do pedido: ${params.orderStatus}`,
    `Status do pagamento: ${params.paymentStatus}`,
    "",
    `Mensagem: ${params.sellerMessage}`,
    "",
    `Acompanhe em: ${trackUrl}`,
    "",
    "Print & Cut 3D"
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
      <h2>Atualizacao do pedido</h2>
      <p>Seu pedido foi atualizado.</p>
      <p><strong>Pedido:</strong> ${params.requestId}<br />
      <strong>Status do pedido:</strong> ${params.orderStatus}<br />
      <strong>Status do pagamento:</strong> ${params.paymentStatus}</p>
      <p><strong>Mensagem:</strong> ${params.sellerMessage}</p>
      <p><a href="${trackUrl}">Acompanhar pedido</a></p>
      <p>Print &amp; Cut 3D</p>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject,
        text,
        html
      })
    });
    if (!response.ok) {
      const raw = await response.text();
      return { sent: false as const, reason: raw || `http_${response.status}` };
    }
    return { sent: true as const };
  } catch (error) {
    return { sent: false as const, reason: error instanceof Error ? error.message : "send_failed" };
  }
}

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

const safeParseMeta = (value: string | null): ParsedMeta => {
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
    const { data, error } = await supabase
      .from("carts")
      .select("id, email, created_at, cart_items(quantity, customization_text, products(title, price_usd))")
      .order("created_at", { ascending: false })
      .limit(40);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []).map((cart) => {
      const items = (cart.cart_items as Array<Record<string, unknown>>) ?? [];
      const meta = safeParseMeta((items[0]?.customization_text as string | null) ?? null);
      const totalUsd = items.reduce((sum, item) => {
        const qty = Number(item.quantity ?? 0);
        const product = (item.products as Record<string, unknown>) ?? {};
        const price = Number(product.price_usd ?? 0);
        return sum + qty * price;
      }, 0);

      return {
        id: cart.id,
        email: cart.email,
        createdAt: cart.created_at,
        customerName: meta.customer_name || "",
        customerPhone: meta.customer_phone || "",
        customerDetails: meta.customer_details || "",
        paymentPreference: meta.payment_preference || "to_be_defined",
        paymentStatus: meta.payment_status || "pending",
        orderStatus: meta.order_status || "received",
        sellerMessage: meta.seller_message || "",
        statusUpdatedAt: meta.status_updated_at || cart.created_at,
        totalItems: items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0),
        estimatedSubtotalUsd: Number(totalUsd.toFixed(2)),
        items: items.map((item) => {
          const product = (item.products as Record<string, unknown>) ?? {};
          const note = safeParseMeta((item.customization_text as string | null) ?? null).item_notes || "";
          const titleObj = (product.title as Record<string, string> | undefined) ?? {};
          return {
            title: titleObj.pt || titleObj.en || "Produto",
            quantity: Number(item.quantity ?? 1),
            unitPriceUsd: Number(product.price_usd ?? 0),
            notes: note
          };
        })
      };
    });

    return NextResponse.json({ requests: rows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao carregar solicitações." },
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
    const body = (await request.json()) as {
      requestId?: string;
      orderStatus?: string;
      paymentStatus?: string;
      sellerMessage?: string;
    };
    const requestId = body.requestId?.trim();
    const orderStatus = body.orderStatus?.trim();
    const paymentStatus = body.paymentStatus?.trim();
    if (!requestId || !orderStatus) {
      return NextResponse.json({ error: "Informe requestId e orderStatus." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: cartRow } = await supabase.from("carts").select("email").eq("id", requestId).single();
    const customerEmail = (cartRow?.email || "").trim().toLowerCase();
    const { data: items, error: readError } = await supabase
      .from("cart_items")
      .select("id, customization_text")
      .eq("cart_id", requestId);

    if (readError) {
      return NextResponse.json({ error: readError.message }, { status: 500 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    const now = new Date().toISOString();
    for (const item of items) {
      const current = safeParseMeta(item.customization_text);
      const next = {
        ...current,
        order_status: orderStatus,
        payment_status: paymentStatus || current.payment_status || "pending",
        seller_message: (body.sellerMessage || "").trim(),
        status_updated_at: now
      };
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ customization_text: JSON.stringify(next) })
        .eq("id", item.id);
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    await supabase.from("carts").update({ last_activity_at: now }).eq("id", requestId);
    const emailResult =
      customerEmail && customerEmail.includes("@")
        ? await sendOrderUpdateEmail({
            to: customerEmail,
            requestId,
            orderStatus,
            paymentStatus: paymentStatus || "pending",
            sellerMessage: (body.sellerMessage || "").trim()
          })
        : { sent: false as const, reason: "missing_customer_email" };

    return NextResponse.json({ success: true, emailSent: emailResult.sent, emailReason: emailResult.reason || null });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar status." },
      { status: 500 }
    );
  }
}
