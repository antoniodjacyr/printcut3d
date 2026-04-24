"use client";

import { useMemo, useState } from "react";
import {
  getInitialPipelineOrders,
  PIPELINE_STAGES,
  type PipelineOrder,
  type PipelineStageId
} from "@/lib/dashboard/mock-metrics";

function groupByStage(orders: PipelineOrder[]) {
  const map = new Map<PipelineStageId, PipelineOrder[]>();
  PIPELINE_STAGES.forEach((s) => map.set(s.id, []));
  orders.forEach((o) => {
    const list = map.get(o.stage) ?? [];
    list.push(o);
    map.set(o.stage, list);
  });
  return map;
}

export function PipelineBoard() {
  const [orders, setOrders] = useState<PipelineOrder[]>(() => getInitialPipelineOrders());

  const grouped = useMemo(() => groupByStage(orders), [orders]);

  const move = (id: string, stage: PipelineStageId) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, stage } : o)));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {PIPELINE_STAGES.map((stage) => (
        <div key={stage.id} className="tech-card flex min-h-[320px] flex-col rounded-2xl p-3">
          <div className="mb-3 border-b border-white/10 pb-2">
            <p className="text-sm font-semibold text-white">{stage.label}</p>
            <p className="text-xs text-zinc-500">{stage.hint}</p>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            {(grouped.get(stage.id) ?? []).map((order) => (
              <article key={order.id} className="rounded-xl border border-white/10 bg-black/25 p-3 text-sm">
                <p className="font-medium text-zinc-100">{order.title}</p>
                <p className="text-xs text-zinc-500">{order.customer}</p>
                <p className="mt-1 text-neon">${order.amountUsd.toFixed(2)}</p>
                {order.tracking && <p className="mt-1 truncate text-xs text-zinc-400">TRK {order.tracking}</p>}
                <label className="mt-2 block text-xs text-zinc-400">
                  Mover para
                  <select
                    className="mt-1 w-full rounded-md border border-white/15 bg-black/40 p-1.5 text-zinc-100"
                    value={order.stage}
                    onChange={(e) => move(order.id, e.target.value as PipelineStageId)}
                  >
                    {PIPELINE_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            ))}
            {(grouped.get(stage.id) ?? []).length === 0 && (
              <p className="text-xs text-zinc-600">Nenhum pedido nesta coluna.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
