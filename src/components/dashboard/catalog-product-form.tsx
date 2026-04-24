"use client";

import Image from "next/image";
import { DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type SubmitState = {
  loading: boolean;
  analyzeLoading: boolean;
  error: string | null;
  success: string | null;
  aiNote: string | null;
};

const mockStoreId = "00000000-0000-0000-0000-000000000001";

export function CatalogProductForm() {
  const [images, setImages] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState<SubmitState>({
    loading: false,
    analyzeLoading: false,
    error: null,
    success: null,
    aiNote: null
  });
  const titleRef = useRef<HTMLInputElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

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

  const analyzeImage = async () => {
    const first = images[0];
    if (!first) {
      setState((s) => ({ ...s, error: "Adicione pelo menos uma foto para análise.", aiNote: null }));
      return;
    }
    setState((s) => ({ ...s, analyzeLoading: true, error: null, aiNote: null }));
    const fd = new FormData();
    fd.set("image", first);
    try {
      const response = await fetch("/api/dashboard/analyze-product-image", { method: "POST", body: fd });
      const data = (await response.json()) as {
        error?: string;
        suggestedTitle?: string;
        suggestedTags?: string[];
        notes?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Falha na análise da imagem.");
      }
      if (titleRef.current && data.suggestedTitle) {
        titleRef.current.value = data.suggestedTitle;
      }
      if (tagsRef.current && data.suggestedTags?.length) {
        tagsRef.current.value = data.suggestedTags.join(", ");
      }
      setState((s) => ({
        ...s,
        analyzeLoading: false,
        aiNote: data.notes ?? "Sugestões aplicadas ao título e tags (revise antes de publicar)."
      }));
    } catch (error) {
      setState((s) => ({
        ...s,
        analyzeLoading: false,
        error: error instanceof Error ? error.message : "Erro na análise.",
        aiNote: null
      }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState((s) => ({ ...s, loading: true, error: null, success: null }));

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

      setState((s) => ({
        ...s,
        loading: false,
        success: `Produto criado. ID: ${data.productId}`,
        error: null,
        aiNote: null
      }));
      target.reset();
      setImages([]);
    } catch (error) {
      setState((s) => ({
        ...s,
        loading: false,
        error: error instanceof Error ? error.message : "Erro inesperado.",
        success: null
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="tech-card space-y-6 rounded-2xl p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-300">Idioma original da descrição</span>
          <select name="originalLanguage" className="rounded-md border border-white/15 bg-black/20 p-2">
            <option value="en">English</option>
            <option value="pt">Português</option>
            <option value="es">Español</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-300">Preço (USD)</span>
          <input
            name="priceUsd"
            type="number"
            step="0.01"
            min="0.01"
            required
            className="rounded-md border border-white/15 bg-black/20 p-2"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-zinc-300">Título</span>
        <input name="title" ref={titleRef} required className="rounded-md border border-white/15 bg-black/20 p-2" />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-zinc-300">Tags SEO (EUA)</span>
        <input
          name="seoTags"
          ref={tagsRef}
          placeholder="petg, laser cut, usa, …"
          className="rounded-md border border-white/15 bg-black/20 p-2"
        />
        <span className="text-xs text-zinc-500">Separadas por vírgula; a IA pode preencher a partir da primeira foto.</span>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-zinc-300">Descrição</span>
        <textarea
          name="description"
          ref={descRef}
          rows={5}
          required
          className="rounded-md border border-white/15 bg-black/20 p-2"
        />
        <span className="text-xs text-zinc-500">
          Gramática nativa + EN/PT/ES são gerados no servidor ao salvar (OpenAI).
        </span>
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-zinc-300">
          Estoque (unid.)
          <input name="stockQty" type="number" step="1" min="0" className="rounded-md border border-white/15 bg-black/20 p-2" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-zinc-300 md:col-span-2">
          Variante (rótulo)
          <input
            name="variantLabel"
            placeholder="Ex.: cor azul / tamanho M"
            className="rounded-md border border-white/15 bg-black/20 p-2"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <input
          name="weightLbs"
          type="number"
          step="0.001"
          min="0"
          placeholder="Peso (lbs)"
          className="rounded-md border border-white/15 bg-black/20 p-2"
        />
        <input
          name="widthIn"
          type="number"
          step="0.01"
          min="0"
          placeholder="Largura (in)"
          className="rounded-md border border-white/15 bg-black/20 p-2"
        />
        <input
          name="heightIn"
          type="number"
          step="0.01"
          min="0"
          placeholder="Altura (in)"
          className="rounded-md border border-white/15 bg-black/20 p-2"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="depthIn"
          type="number"
          step="0.01"
          min="0"
          placeholder="Profundidade (in)"
          className="rounded-md border border-white/15 bg-black/20 p-2"
        />
        <label className="flex items-center gap-2 rounded-md border border-white/15 bg-black/20 p-2">
          <input name="hasCustomization" type="checkbox" value="true" />
          <span className="text-sm">Permite personalização</span>
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

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={analyzeImage}
          disabled={state.analyzeLoading}
          className="rounded-lg border border-neon/50 bg-neon/10 px-4 py-2 text-sm font-semibold text-neon transition hover:bg-neon/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.analyzeLoading ? "Analisando…" : "IA: sugerir título e tags (GPT-4o)"}
        </button>
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

      {state.aiNote && <p className="text-sm text-emerald-300/90">{state.aiNote}</p>}
      {state.error && <p className="text-sm text-red-300">{state.error}</p>}
      {state.success && <p className="text-sm text-green-300">{state.success}</p>}

      <button
        type="submit"
        disabled={state.loading}
        className="rounded-lg bg-neon px-5 py-2.5 font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state.loading ? "Salvando…" : "Salvar produto"}
      </button>
    </form>
  );
}
