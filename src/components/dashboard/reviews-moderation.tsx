"use client";

import { useMemo, useState } from "react";
import type { ReviewRow } from "@/lib/dashboard/mock-metrics";

export function ReviewsModeration({ initial }: { initial: ReviewRow[] }) {
  const [rows, setRows] = useState(initial);
  const [gallery, setGallery] = useState<string[]>([]);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [replySaved, setReplySaved] = useState<Record<string, boolean>>({});

  const pending = useMemo(() => rows.filter((r) => r.status === "pending"), [rows]);

  const approve = (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r)));
  };

  const toggleGallery = (id: string) => {
    setGallery((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  };

  const setReplyDraft = (id: string, text: string) => {
    setReplies((prev) => ({ ...prev, [id]: text }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="tech-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white">Moderação de avaliações</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Aprove comentários antes de publicar na loja; resposta pública (rascunho local — depois persistir em Supabase).
        </p>
        <ul className="mt-4 space-y-4">
          {rows.map((r) => (
            <li key={r.id} className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-zinc-100">{r.product}</span>
                <span className="text-xs text-amber-300">{r.rating}★</span>
              </div>
              <p className="mt-2 text-zinc-300">{r.comment}</p>
              <label className="mt-3 block text-xs text-zinc-500">
                Resposta pública (rascunho)
                <textarea
                  value={replies[r.id] ?? ""}
                  onChange={(e) => setReplyDraft(r.id, e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-zinc-200"
                  placeholder="Obrigado pelo feedback…"
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => approve(r.id)}
                    className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200"
                  >
                    Aprovar
                  </button>
                )}
                {r.status === "approved" && <span className="text-xs text-emerald-400">Aprovado</span>}
                <button
                  type="button"
                  className="rounded-lg border border-white/20 px-3 py-1 text-xs text-zinc-300 hover:border-neon/40"
                  onClick={() => {
                    setReplySaved((prev) => ({ ...prev, [r.id]: true }));
                    window.setTimeout(() => {
                      setReplySaved((prev) => ({ ...prev, [r.id]: false }));
                    }, 2000);
                  }}
                >
                  Guardar rascunho
                </button>
                {replySaved[r.id] && <span className="text-xs text-emerald-400">Rascunho registado (local).</span>}
                {r.photo && (
                  <button
                    type="button"
                    onClick={() => toggleGallery(r.id)}
                    className={`rounded-lg border px-3 py-1 text-xs ${
                      gallery.includes(r.id)
                        ? "border-neon text-neon"
                        : "border-white/20 text-zinc-300 hover:border-neon/40"
                    }`}
                  >
                    {gallery.includes(r.id) ? "Na galeria home" : "Destaque na home"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {pending.length === 0 && <p className="mt-4 text-xs text-zinc-500">Nenhuma avaliação pendente.</p>}
      </section>

      <section className="tech-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white">Galeria de clientes (prova social EUA)</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Fotos enviadas por compradores, aprovadas aqui, depois exibidas na página inicial para gerar confiança.
        </p>
        <ul className="mt-4 list-inside list-disc text-sm text-zinc-400">
          {gallery.length === 0 && <li>Nenhuma foto destacada ainda.</li>}
          {gallery.map((id) => (
            <li key={id}>Review {id} — slot reservado para mídia na home</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
