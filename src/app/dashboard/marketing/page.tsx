import { getMockAbandonedCarts, getMockCrm } from "@/lib/dashboard/mock-metrics";

export default function DashboardMarketingPage() {
  const carts = getMockAbandonedCarts();
  const crm = getMockCrm();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Marketing & retenção</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Carrinhos abandonados: lista quem não finalizou; botão de cupom automático por e-mail (integrar Resend,
          SendGrid ou provedor SMTP). CRM básico para compradores recorrentes (B2B).
        </p>
      </div>

      <section className="tech-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Carrinhos abandonados</h3>
          <button
            type="button"
            disabled
            className="rounded-lg border border-neon/40 px-3 py-1.5 text-xs font-semibold text-neon opacity-60"
          >
            Enviar cupom (e-mail API)
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="pb-2 pr-4">Cliente</th>
                <th className="pb-2 pr-4">Último item</th>
                <th className="pb-2 pr-4">Valor</th>
                <th className="pb-2">Há</th>
              </tr>
            </thead>
            <tbody>
              {carts.map((c) => (
                <tr key={c.email} className="border-t border-white/10">
                  <td className="py-3 pr-4">{c.email}</td>
                  <td className="py-3 pr-4">{c.lastItem}</td>
                  <td className="py-3 pr-4 text-neon">${c.valueUsd}</td>
                  <td className="py-3">{c.hoursAgo}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="tech-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white">CRM básico (B2B / recorrentes)</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="pb-2 pr-4">E-mail</th>
                <th className="pb-2 pr-4">Pedidos</th>
                <th className="pb-2 pr-4">LTV</th>
                <th className="pb-2">Último</th>
              </tr>
            </thead>
            <tbody>
              {crm.map((row) => (
                <tr key={row.email} className="border-t border-white/10">
                  <td className="py-3 pr-4">{row.email}</td>
                  <td className="py-3 pr-4">{row.orders}</td>
                  <td className="py-3 pr-4 text-neon">${row.lifetimeUsd.toLocaleString("en-US")}</td>
                  <td className="py-3">{row.lastOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
