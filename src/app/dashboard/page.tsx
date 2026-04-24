import { DashboardChartsLazy } from "@/components/dashboard/dashboard-charts-lazy";
import { getKpis, getMonthlySalesSeries, getTopProducts } from "@/lib/dashboard/mock-metrics";

export default function DashboardHomePage() {
  const kpis = getKpis();
  const monthly = getMonthlySalesSeries();
  const top = getTopProducts();

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl font-semibold text-white">Visão geral</h2>
        <p className="mt-1 text-sm text-zinc-400">
          KPIs no servidor (RSC). Gráficos Recharts carregam no cliente em chunk separado — dados mock até integrar
          Stripe/Supabase; depois pode atualizar a série em tempo real (polling ou Realtime).
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Receita 30d", value: `$${kpis.revenue30d.toLocaleString("en-US")}` },
          { label: "Pedidos 30d", value: String(kpis.orders30d) },
          { label: "Ticket médio", value: `$${kpis.avgTicketUsd}` },
          { label: "Sua parte (est.)", value: `$${kpis.yourShareUsd.toLocaleString("en-US")}` }
        ].map((card) => (
          <div key={card.label} className="tech-card rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <DashboardChartsLazy monthly={monthly} topProducts={top} />
    </div>
  );
}
