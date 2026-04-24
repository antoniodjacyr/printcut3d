export type MonthlySalesPoint = { label: string; gross: number; net: number; avgTicketUsd: number };
export type TopProduct = { name: string; units: number; revenue: number };

/** Últimos meses (mock) — substituir por agregados Stripe/Supabase. */
export function getMonthlySalesSeries(): MonthlySalesPoint[] {
  return [
    { label: "Nov", gross: 11200, net: 10304, avgTicketUsd: 275 },
    { label: "Dez", gross: 13840, net: 12733, avgTicketUsd: 288 },
    { label: "Jan", gross: 12180, net: 11206, avgTicketUsd: 295 },
    { label: "Fev", gross: 15220, net: 14002, avgTicketUsd: 302 },
    { label: "Mar", gross: 14600, net: 13432, avgTicketUsd: 298 },
    { label: "Abr", gross: 18420, net: 16947, avgTicketUsd: 302 }
  ];
}

export function getTopProducts(): TopProduct[] {
  return [
    { name: "PETG housing kit", units: 42, revenue: 2016 },
    { name: "Laser desk organizer", units: 36, revenue: 1296 },
    { name: "Jig plate (ABS)", units: 18, revenue: 1116 }
  ];
}

export function getKpis() {
  return {
    revenue30d: 18420,
    orders30d: 61,
    avgTicketUsd: 302,
    platformCommissionUsd: 1473,
    yourShareUsd: 16947
  };
}

export type PipelineStageId =
  | "new_order"
  | "awaiting_file"
  | "in_production"
  | "ready_ship"
  | "shipped";

export type PipelineOrder = {
  id: string;
  title: string;
  customer: string;
  amountUsd: number;
  stage: PipelineStageId;
  tracking?: string;
};

export const PIPELINE_STAGES: { id: PipelineStageId; label: string; hint: string }[] = [
  { id: "new_order", label: "Novo pedido", hint: "Pagamento confirmado pelo Stripe" },
  { id: "awaiting_file", label: "Aguardando Design/Arquivo", hint: "Cliente envia logo / arte para gravação" },
  { id: "in_production", label: "Em produção", hint: "Na impressora 3D ou no laser" },
  { id: "ready_ship", label: "Pronto para envio", hint: "Gatilho para gerar etiqueta (USPS/UPS/FedEx)" },
  { id: "shipped", label: "Enviado", hint: "Rastreamento automático ativo" }
];

export function getInitialPipelineOrders(): PipelineOrder[] {
  return [
    { id: "ord_101", title: "Kit housing PETG ×2", customer: "Studio North", amountUsd: 96, stage: "new_order" },
    { id: "ord_102", title: "Organizador + gravação", customer: "Bright Co.", amountUsd: 36, stage: "awaiting_file" },
    { id: "ord_103", title: "Placa ABS produção", customer: "FabLab TX", amountUsd: 186, stage: "in_production" },
    { id: "ord_104", title: "Brindes laser acrílico", customer: "GiftDrop", amountUsd: 240, stage: "ready_ship" },
    { id: "ord_105", title: "Protótipo ASA", customer: "Orbit Labs", amountUsd: 128, stage: "shipped", tracking: "9400111899223345678901" }
  ];
}

export type ReviewRow = {
  id: string;
  product: string;
  rating: number;
  comment: string;
  status: "pending" | "approved";
  photo: boolean;
};

export function getMockReviews(): ReviewRow[] {
  return [
    {
      id: "rev_1",
      product: "PETG housing kit",
      rating: 5,
      comment: "Perfect fit for our enclosure. Will order again.",
      status: "pending",
      photo: true
    },
    {
      id: "rev_2",
      product: "Laser desk organizer",
      rating: 4,
      comment: "Great finish, shipping was fast to CA.",
      status: "approved",
      photo: false
    }
  ];
}

export type AbandonedCart = { email: string; lastItem: string; valueUsd: number; hoursAgo: number };

export function getMockAbandonedCarts(): AbandonedCart[] {
  return [
    { email: "buyer1@example.com", lastItem: "Jig plate (ABS)", valueUsd: 62, hoursAgo: 6 },
    { email: "buyer2@example.com", lastItem: "PETG housing kit", valueUsd: 96, hoursAgo: 26 }
  ];
}

export type CrmCustomer = { email: string; orders: number; lifetimeUsd: number; lastOrder: string };

export function getMockCrm(): CrmCustomer[] {
  return [
    { email: "studio@north.com", orders: 5, lifetimeUsd: 1180, lastOrder: "2026-04-18" },
    { email: "fablab@tx.org", orders: 12, lifetimeUsd: 3420, lastOrder: "2026-04-21" }
  ];
}
