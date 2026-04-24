import { DashboardChartsLazy } from "@/components/dashboard/dashboard-charts-lazy";
import { FinanceSplitPanel } from "@/components/dashboard/finance-split-panel";
import { getFinanceFlags } from "@/lib/dashboard/mock-finance";
import { getKpis, getMonthlySalesSeries, getTopProducts } from "@/lib/dashboard/mock-metrics";

export default function DashboardFinancePage() {
  const kpis = getKpis();
  const flags = getFinanceFlags();
  const feePct = flags.isAdminStore ? 0 : flags.platformFeePct;
  const total = kpis.revenue30d;
  const platformUsd = flags.isAdminStore ? 0 : kpis.platformCommissionUsd;
  const yourUsd = flags.isAdminStore ? total : kpis.yourShareUsd;
  const monthly = getMonthlySalesSeries();
  const top = getTopProducts();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Financeiro</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Split estilo Stripe Connect: total da venda, comissão da plataforma (8%) e sua parte. Loja admin (
          <code className="text-neon/90">is_admin_store</code>) = 0% de taxa em mock — ligue à sua tabela de lojas.
        </p>
      </div>

      <FinanceSplitPanel
        totalUsd={total}
        platformUsd={platformUsd}
        yourUsd={yourUsd}
        platformFeePct={feePct}
        isAdminStore={flags.isAdminStore}
      />

      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">Relatórios</h3>
        <p className="mb-4 text-xs text-zinc-500">
          Faturamento mensal, ticket médio e ranking de produtos — mesmos gráficos da visão geral (mock).
        </p>
        <DashboardChartsLazy monthly={monthly} topProducts={top} />
      </div>
    </div>
  );
}
