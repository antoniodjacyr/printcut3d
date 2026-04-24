"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatUsd } from "@/lib/dashboard/mock-finance";

const tooltip = {
  contentStyle: {
    background: "#0f172a",
    border: "1px solid rgba(148,163,184,0.25)",
    borderRadius: 8,
    color: "#e2e8f0"
  }
};

export function FinanceSplitPanel({
  totalUsd,
  platformUsd,
  yourUsd,
  platformFeePct,
  isAdminStore
}: {
  totalUsd: number;
  platformUsd: number;
  yourUsd: number;
  platformFeePct: number;
  isAdminStore: boolean;
}) {
  const data = [
    { name: "Sua parte", value: Math.max(yourUsd, 0) },
    { name: isAdminStore ? "Taxa (isenção)" : "Plataforma", value: Math.max(platformUsd, 0) }
  ];
  const colors = ["#5de2ff", isAdminStore ? "#475569" : "#a78bfa"];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="tech-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white">Split Stripe Connect (mock)</h3>
        <p className="mt-1 text-xs text-zinc-500">
          {isAdminStore
            ? "Loja admin: taxa da plataforma 0% nas vendas diretas (is_admin_store)."
            : `Comissão da plataforma: ${platformFeePct}% sobre o total.`}
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/25 p-4">
            <dt className="text-xs text-zinc-500">Total da venda</dt>
            <dd className="mt-1 text-xl font-semibold text-white">{formatUsd(totalUsd)}</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 p-4">
            <dt className="text-xs text-zinc-500">{isAdminStore ? "Comissão (0%)" : "Comissão plataforma"}</dt>
            <dd className="mt-1 text-xl font-semibold text-violet-300">{formatUsd(platformUsd)}</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 p-4">
            <dt className="text-xs text-zinc-500">Sua parte</dt>
            <dd className="mt-1 text-xl font-semibold text-neon">{formatUsd(yourUsd)}</dd>
          </div>
        </dl>
      </div>
      <div className="tech-card flex flex-col rounded-2xl p-4">
        <p className="text-center text-xs text-zinc-500">Distribuição</p>
        <div className="min-h-[220px] flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={2}>
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i] ?? "#64748b"} />
                ))}
              </Pie>
              <Tooltip {...tooltip} formatter={(v: number) => formatUsd(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
