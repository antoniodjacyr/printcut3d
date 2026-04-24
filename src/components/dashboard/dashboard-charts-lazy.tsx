"use client";

import dynamic from "next/dynamic";
import type { MonthlySalesPoint, TopProduct } from "@/lib/dashboard/mock-metrics";

function ChartsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tech-card h-64 animate-pulse rounded-2xl bg-white/5 sm:h-72" />
        <div className="tech-card h-64 animate-pulse rounded-2xl bg-white/5 sm:h-72" />
      </div>
      <div className="tech-card h-64 animate-pulse rounded-2xl bg-white/5 sm:h-72" />
    </div>
  );
}

const LazyCharts = dynamic(
  () => import("./dashboard-overview-charts").then((m) => m.DashboardOverviewCharts),
  { ssr: false, loading: ChartsSkeleton }
);

export function DashboardChartsLazy({
  monthly,
  topProducts
}: {
  monthly: MonthlySalesPoint[];
  topProducts: TopProduct[];
}) {
  return <LazyCharts monthly={monthly} topProducts={topProducts} />;
}
