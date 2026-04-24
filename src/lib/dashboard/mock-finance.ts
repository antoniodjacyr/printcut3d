/**
 * Mock de regras financeiras. Em produção: ler `is_admin_store` (ou equivalente) da loja no Supabase.
 * `isAdminStore: true` → comissão da plataforma 0% nas vendas diretas da sua loja.
 */
export function getFinanceFlags() {
  return { isAdminStore: false, platformFeePct: 8 as const };
}

export function formatUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
