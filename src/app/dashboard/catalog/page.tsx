"use client";

import { useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { CatalogProductForm } from "@/components/dashboard/catalog-product-form";
import { CatalogProductList } from "@/components/dashboard/catalog-product-list";

export default function DashboardCatalogPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const { locale } = useLocale();
  const copy =
    locale === "pt"
      ? {
          title: "Gestão inteligente de produtos",
          subtitle: "Catálogo focado no mercado EUA: fotos, SEO, tradução e medidas imperiais.",
          li1: "Upload inteligente:",
          li1d: "arrastar e soltar fotos; IA (GPT-4o) sugere título e tags para busca nos EUA.",
          li2: "Tradução e gramática:",
          li2d: "descreva em PT ou EN — ao salvar, o servidor corrige e gera EN / PT / ES (OpenAI).",
          li3: "Stock e variantes:",
          li3d: "USD, lbs, polegadas (in), estoque e rótulo de variante."
        }
      : locale === "es"
        ? {
            title: "Gestión inteligente de productos",
            subtitle: "Catálogo enfocado en EE. UU.: fotos, SEO, traducción y medidas imperiales.",
            li1: "Carga inteligente:",
            li1d: "arrastrar y soltar fotos; IA (GPT-4o) sugiere título y etiquetas SEO para EE. UU.",
            li2: "Traducción y gramática:",
            li2d: "describe en PT o EN; al guardar, el servidor corrige y genera EN / PT / ES.",
            li3: "Stock y variantes:",
            li3d: "USD, lbs, pulgadas (in), stock y etiqueta de variante."
          }
        : {
            title: "Smart product management",
            subtitle: "US-focused catalog: photos, SEO, translation, and imperial measurements.",
            li1: "Smart upload:",
            li1d: "drag-and-drop photos; AI (GPT-4o) suggests US SEO title and tags.",
            li2: "Translation and grammar:",
            li2d: "write in PT or EN; on save, server corrects and generates EN / PT / ES.",
            li3: "Stock and variants:",
            li3d: "USD, lbs, inches (in), stock and variant label."
          };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">{copy.title}</h2>
        <p className="mt-1 text-sm text-zinc-400">{copy.subtitle}</p>
        <ul className="mt-3 list-inside list-disc text-sm text-zinc-500">
          <li>
            <strong className="text-zinc-400">{copy.li1}</strong> {copy.li1d}
          </li>
          <li>
            <strong className="text-zinc-400">{copy.li2}</strong> {copy.li2d}
          </li>
          <li>
            <strong className="text-zinc-400">{copy.li3}</strong> {copy.li3d}
          </li>
        </ul>
      </div>
      <CatalogProductList refreshToken={refreshToken} />
      <CatalogProductForm onProductsCreated={() => setRefreshToken((v) => v + 1)} />
    </div>
  );
}
