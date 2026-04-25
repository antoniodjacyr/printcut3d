"use client";

import Image from "next/image";
import { DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";

type SubmitState = {
  loading: boolean;
  analyzeLoading: boolean;
  error: string | null;
  success: string | null;
  aiNote: string | null;
};

const mockStoreId = "00000000-0000-0000-0000-000000000001";

export function CatalogProductForm({ onProductsCreated }: { onProductsCreated?: () => void }) {
  const { locale } = useLocale();
  const copy =
    locale === "pt"
      ? {
          needPhoto: "Adicione pelo menos uma foto para análise.",
          analyzeFail: "Falha na análise da imagem.",
          aiApplied: "Sugestões aplicadas ao título e tags (revise antes de publicar).",
          analyzeError: "Erro na análise.",
          invalidServer: "Resposta inválida do servidor.",
          saveFail: "Falha ao salvar produto.",
          created: "Produto(s) criado(s)",
          refId: "ID referência",
          unexpected: "Erro inesperado.",
          originalLanguage: "Idioma original da descrição",
          price: "Preço (USD)",
          title: "Título",
          seoTags: "Tags SEO (EUA)",
          seoPlaceholder: "petg, laser cut, usa, ...",
          seoHint: "Separadas por vírgula; a IA pode preencher a partir da primeira foto.",
          description: "Descrição",
          grammarHint: "Gramática nativa + EN/PT/ES são gerados no servidor ao salvar (OpenAI).",
          stock: "Estoque (unid.)",
          variant: "Variante (rótulo)",
          variantPlaceholder: "Ex.: cor azul / tamanho M",
          batchCount: "Quantidade para criar de uma vez",
          online: "Disponível online (aparece para comprador)",
          weight: "Peso (lbs)",
          width: "Largura (in)",
          height: "Altura (in)",
          depth: "Profundidade (in)",
          customization: "Permite personalização",
          dragDrop: "Arraste e solte fotos aqui",
          analyze: "IA: sugerir título e tags (GPT-4o)",
          analyzing: "Analisando...",
          saving: "Salvando...",
          save: "Salvar produto"
        }
      : locale === "es"
        ? {
            needPhoto: "Agrega al menos una foto para análisis.",
            analyzeFail: "Falló el análisis de imagen.",
            aiApplied: "Sugerencias aplicadas a título y etiquetas (revísalas antes de publicar).",
            analyzeError: "Error de análisis.",
            invalidServer: "Respuesta inválida del servidor.",
            saveFail: "No se pudo guardar el producto.",
            created: "Producto(s) creado(s)",
            refId: "ID de referencia",
            unexpected: "Error inesperado.",
            originalLanguage: "Idioma original de la descripción",
            price: "Precio (USD)",
            title: "Título",
            seoTags: "Etiquetas SEO (EE. UU.)",
            seoPlaceholder: "petg, laser cut, usa, ...",
            seoHint: "Separadas por coma; la IA puede completar desde la primera foto.",
            description: "Descripción",
            grammarHint: "Gramática nativa + EN/PT/ES se genera al guardar (OpenAI).",
            stock: "Stock (unid.)",
            variant: "Variante (etiqueta)",
            variantPlaceholder: "Ej.: color azul / talla M",
            batchCount: "Cantidad para crear de una vez",
            online: "Disponible online (aparece para comprador)",
            weight: "Peso (lbs)",
            width: "Ancho (in)",
            height: "Alto (in)",
            depth: "Profundidad (in)",
            customization: "Permite personalización",
            dragDrop: "Arrastra y suelta fotos aquí",
            analyze: "IA: sugerir título y etiquetas (GPT-4o)",
            analyzing: "Analizando...",
            saving: "Guardando...",
            save: "Guardar producto"
          }
        : {
            needPhoto: "Add at least one photo for analysis.",
            analyzeFail: "Image analysis failed.",
            aiApplied: "Suggestions applied to title and tags (review before publishing).",
            analyzeError: "Analysis error.",
            invalidServer: "Invalid server response.",
            saveFail: "Failed to save product.",
            created: "Product(s) created",
            refId: "Reference ID",
            unexpected: "Unexpected error.",
            originalLanguage: "Original description language",
            price: "Price (USD)",
            title: "Title",
            seoTags: "SEO tags (US)",
            seoPlaceholder: "petg, laser cut, usa, ...",
            seoHint: "Comma-separated; AI can fill from first photo.",
            description: "Description",
            grammarHint: "Native grammar + EN/PT/ES generated on save (OpenAI).",
            stock: "Stock (units)",
            variant: "Variant (label)",
            variantPlaceholder: "Ex.: blue color / size M",
            batchCount: "Quantity to create in batch",
            online: "Available online (shown to buyer)",
            weight: "Weight (lbs)",
            width: "Width (in)",
            height: "Height (in)",
            depth: "Depth (in)",
            customization: "Allows customization",
            dragDrop: "Drag and drop photos here",
            analyze: "AI: suggest title and tags (GPT-4o)",
            analyzing: "Analyzing...",
            saving: "Saving...",
            save: "Save product"
          };
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
      setState((s) => ({ ...s, error: copy.needPhoto, aiNote: null }));
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
        throw new Error(data.error || copy.analyzeFail);
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
        aiNote: data.notes ?? copy.aiApplied
      }));
    } catch (error) {
      setState((s) => ({
        ...s,
        analyzeLoading: false,
        error: error instanceof Error ? error.message : copy.analyzeError,
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
      let data: { error?: string; productId?: string; createdCount?: number } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        throw new Error(
          response.ok
            ? copy.invalidServer
            : `Erro ${response.status}: ${raw.slice(0, 200) || response.statusText}`
        );
      }
      if (!response.ok) {
        throw new Error(data.error || copy.saveFail);
      }

      setState((s) => ({
        ...s,
        loading: false,
        success: `${copy.created}: ${data.createdCount ?? 1}. ${copy.refId}: ${data.productId}`,
        error: null,
        aiNote: null
      }));
      target.reset();
      setImages([]);
      onProductsCreated?.();
    } catch (error) {
      setState((s) => ({
        ...s,
        loading: false,
        error: error instanceof Error ? error.message : copy.unexpected,
        success: null
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="tech-card space-y-6 rounded-2xl p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-300">{copy.originalLanguage}</span>
          <select name="originalLanguage" className="rounded-md border border-white/15 bg-black/20 p-2">
            <option value="en">English</option>
            <option value="pt">Português</option>
            <option value="es">Español</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-zinc-300">{copy.price}</span>
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
        <span className="text-sm text-zinc-300">{copy.title}</span>
        <input name="title" ref={titleRef} required className="rounded-md border border-white/15 bg-black/20 p-2" />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-zinc-300">{copy.seoTags}</span>
        <input
          name="seoTags"
          ref={tagsRef}
          placeholder={copy.seoPlaceholder}
          className="rounded-md border border-white/15 bg-black/20 p-2"
        />
        <span className="text-xs text-zinc-500">{copy.seoHint}</span>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-zinc-300">{copy.description}</span>
        <textarea
          name="description"
          ref={descRef}
          rows={5}
          required
          className="rounded-md border border-white/15 bg-black/20 p-2"
        />
        <span className="text-xs text-zinc-500">
          {copy.grammarHint}
        </span>
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-zinc-300">
          {copy.stock}
          <input name="stockQty" type="number" step="1" min="0" className="rounded-md border border-white/15 bg-black/20 p-2" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-zinc-300 md:col-span-2">
          {copy.variant}
          <input
            name="variantLabel"
            placeholder={copy.variantPlaceholder}
            className="rounded-md border border-white/15 bg-black/20 p-2"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-zinc-300">
          {copy.batchCount}
          <input
            name="batchCount"
            type="number"
            min="1"
            max="25"
            defaultValue={1}
            className="rounded-md border border-white/15 bg-black/20 p-2"
          />
        </label>
        <label className="flex items-center gap-2 rounded-md border border-white/15 bg-black/20 p-2">
          <input name="isOnline" type="checkbox" value="true" />
          <span className="text-sm">{copy.online}</span>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <input
          name="weightLbs"
          type="number"
          step="0.001"
          min="0"
          placeholder={copy.weight}
          className="rounded-md border border-white/15 bg-black/20 p-2"
        />
        <input
          name="widthIn"
          type="number"
          step="0.01"
          min="0"
          placeholder={copy.width}
          className="rounded-md border border-white/15 bg-black/20 p-2"
        />
        <input
          name="heightIn"
          type="number"
          step="0.01"
          min="0"
          placeholder={copy.height}
          className="rounded-md border border-white/15 bg-black/20 p-2"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="depthIn"
          type="number"
          step="0.01"
          min="0"
          placeholder={copy.depth}
          className="rounded-md border border-white/15 bg-black/20 p-2"
        />
        <label className="flex items-center gap-2 rounded-md border border-white/15 bg-black/20 p-2">
          <input name="hasCustomization" type="checkbox" value="true" />
          <span className="text-sm">{copy.customization}</span>
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
        <p className="mb-3 text-zinc-200">{copy.dragDrop}</p>
        <input type="file" accept="image/*" multiple onChange={(event) => appendFiles(event.target.files)} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={analyzeImage}
          disabled={state.analyzeLoading}
          className="rounded-lg border border-neon/50 bg-neon/10 px-4 py-2 text-sm font-semibold text-neon transition hover:bg-neon/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.analyzeLoading ? copy.analyzing : copy.analyze}
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
        {state.loading ? copy.saving : copy.save}
      </button>
    </form>
  );
}
