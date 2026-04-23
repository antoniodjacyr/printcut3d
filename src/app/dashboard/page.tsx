"use client";

import Image from "next/image";
import { DragEvent, FormEvent, useEffect, useMemo, useState } from "react";

type SubmitState = {
  loading: boolean;
  error: string | null;
  success: string | null;
};

const mockStoreId = "00000000-0000-0000-0000-000000000001";

export default function DashboardPage() {
  const [images, setImages] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState<SubmitState>({ loading: false, error: null, success: null });

  const previewUrls = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const appendFiles = (files: FileList | null) => {
    if (!files) return;
    setImages((current) => [...current, ...Array.from(files)]);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    appendFiles(event.dataTransfer.files);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState({ loading: true, error: null, success: null });

    const target = event.currentTarget;
    const formData = new FormData(target);
    formData.set("storeId", mockStoreId);
    images.forEach((file) => formData.append("images", file));

    try {
      const response = await fetch("/api/dashboard/products", {
        method: "POST",
        body: formData
      });
      const raw = await response.text();
      let data: { error?: string; productId?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        throw new Error(
          response.ok
            ? "Resposta inválida do servidor."
            : `Erro ${response.status}: ${raw.slice(0, 200) || response.statusText}`
        );
      }
      if (!response.ok) {
        throw new Error(data.error || "Falha ao salvar produto.");
      }

      setState({
        loading: false,
        error: null,
        success: `Produto criado com sucesso. ID: ${data.productId}`
      });
      target.reset();
      setImages([]);
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : "Erro inesperado.",
        success: null
      });
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard do Vendedor</h1>
        <p className="mt-2 text-zinc-300">
          Cadastre produtos com revisão automática de gramática, tradução EN/PT/ES e upload de imagens por arrastar e soltar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="tech-card space-y-6 rounded-2xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-zinc-300">Idioma original</span>
            <select name="originalLanguage" className="rounded-md border border-white/15 bg-black/20 p-2">
              <option value="en">English</option>
              <option value="pt">Português</option>
              <option value="es">Español</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-zinc-300">Preço (USD)</span>
            <input name="priceUsd" type="number" step="0.01" min="0.01" required className="rounded-md border border-white/15 bg-black/20 p-2" />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-300">Título</span>
          <input name="title" required className="rounded-md border border-white/15 bg-black/20 p-2" />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-300">Descrição</span>
          <textarea name="description" rows={5} required className="rounded-md border border-white/15 bg-black/20 p-2" />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <input name="weightLbs" type="number" step="0.001" min="0" placeholder="Peso (lbs)" className="rounded-md border border-white/15 bg-black/20 p-2" />
          <input name="widthIn" type="number" step="0.01" min="0" placeholder="Largura (in)" className="rounded-md border border-white/15 bg-black/20 p-2" />
          <input name="heightIn" type="number" step="0.01" min="0" placeholder="Altura (in)" className="rounded-md border border-white/15 bg-black/20 p-2" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input name="depthIn" type="number" step="0.01" min="0" placeholder="Profundidade (in)" className="rounded-md border border-white/15 bg-black/20 p-2" />
          <label className="flex items-center gap-2 rounded-md border border-white/15 bg-black/20 p-2">
            <input name="hasCustomization" type="checkbox" value="true" />
            <span>Permite personalização</span>
          </label>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`rounded-xl border-2 border-dashed p-6 text-center transition ${
            dragging ? "border-neon bg-neon/10" : "border-white/20 bg-white/5"
          }`}
        >
          <p className="mb-3 text-zinc-200">Arraste e solte fotos aqui</p>
          <input type="file" accept="image/*" multiple onChange={(event) => appendFiles(event.target.files)} />
        </div>

        {previewUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {previewUrls.map((url, idx) => (
              <Image
                key={url}
                src={url}
                alt={`Preview ${idx + 1}`}
                width={360}
                height={220}
                unoptimized
                className="h-28 w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        {state.error && <p className="text-sm text-red-300">{state.error}</p>}
        {state.success && <p className="text-sm text-green-300">{state.success}</p>}

        <button
          type="submit"
          disabled={state.loading}
          className="rounded-lg bg-neon px-5 py-2.5 font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.loading ? "Salvando..." : "Salvar Produto"}
        </button>
      </form>
    </section>
  );
}
