"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "printcut3d_dashboard_brand_story";

export function BrandStoryEditor() {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v) setValue(v);
    } catch {
      /* ignore */
    }
  }, []);

  const save = () => {
    try {
      localStorage.setItem(KEY, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="tech-card space-y-4 rounded-2xl p-6">
      <div>
        <h3 className="text-sm font-semibold text-white">História da marca / oficina</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Storytelling da marca: oficina, maquinário e valor artesanal + tecnológico. Rascunho em{" "}
          <code className="text-neon">localStorage</code>; para publicar, integre com a página{" "}
          <Link href="/quem-somos" className="text-neon hover:underline">
            Quem somos
          </Link>{" "}
          ou um CMS.
        </p>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={14}
        className="w-full rounded-xl border border-white/15 bg-black/30 p-4 text-sm text-zinc-100"
        placeholder="Conte a história do ateliê, equipamentos (impressoras, laser), materiais e prazos nos EUA…"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
        >
          Guardar rascunho
        </button>
        {saved && <span className="text-xs text-emerald-400">Guardado neste browser.</span>}
      </div>
    </div>
  );
}
