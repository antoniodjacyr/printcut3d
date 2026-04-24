"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { MonthlySalesPoint, TopProduct } from "@/lib/dashboard/mock-metrics";

const axis = { stroke: "#64748b", fontSize: 11 };
const grid = { stroke: "rgba(148,163,184,0.15)" };
const tooltip = {
  contentStyle: {
    background: "#0f172a",
    border: "1px solid rgba(148,163,184,0.25)",
    borderRadius: 8,
    color: "#e2e8f0"
  }
};

export function DashboardOverviewCharts({
  monthly,
  topProducts
}: {
  monthly: MonthlySalesPoint[];
  topProducts: TopProduct[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tech-card rounded-2xl p-4">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-white">Faturamento mensal (mock)</h2>
            <span className="text-xs text-zinc-500">Bruto vs sua parte (após 8% plataforma)</span>
          </div>
          <div className="h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" {...grid} />
                <XAxis dataKey="label" tick={axis} />
                <YAxis tick={axis} tickFormatter={(v) => `$${v}`} width={48} />
                <Tooltip {...tooltip} formatter={(value: number) => [`$${value.toLocaleString("en-US")}`, ""]} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Line type="monotone" dataKey="gross" name="Total" stroke="#5de2ff" strokeWidth={2} dot />
                <Line type="monotone" dataKey="net" name="Sua parte" stroke="#a78bfa" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="tech-card rounded-2xl p-4">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-white">Ticket médio (USD)</h2>
            <p className="text-xs text-zinc-500">Por mês — conecte pedidos reais para série ao vivo</p>
          </div>
          <div className="h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" {...grid} />
                <XAxis dataKey="label" tick={axis} />
                <YAxis tick={axis} tickFormatter={(v) => `$${v}`} width={44} domain={["auto", "auto"]} />
                <Tooltip {...tooltip} formatter={(value: number) => [`$${value}`, "Ticket médio"]} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Line
                  type="monotone"
                  dataKey="avgTicketUsd"
                  name="Ticket médio"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="tech-card rounded-2xl p-4">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-white">Produtos mais vendidos</h2>
          <p className="text-xs text-zinc-500">Unidades × receita estimada (EUA)</p>
        </div>
        <div className="h-64 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} />
              <XAxis dataKey="name" tick={axis} interval={0} angle={-18} textAnchor="end" height={56} />
              <YAxis yAxisId="left" tick={axis} width={32} />
              <YAxis yAxisId="right" orientation="right" tick={axis} width={40} tickFormatter={(v) => `$${v}`} />
              <Tooltip {...tooltip} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              <Bar yAxisId="left" dataKey="units" name="Unidades" fill="#5de2ff" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" name="Receita ($)" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
