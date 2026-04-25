"use client";

import { useState } from "react";
import { CatalogProductForm } from "@/components/dashboard/catalog-product-form";
import { CatalogProductList } from "@/components/dashboard/catalog-product-list";
import { QuoteRequestsList } from "@/components/dashboard/quote-requests-list";

export default function DashboardCatalogPage() {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Gestão inteligente de produtos</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Catálogo focado no mercado EUA: fotos, SEO, tradução e medidas imperiais.
        </p>
        <ul className="mt-3 list-inside list-disc text-sm text-zinc-500">
          <li>
            <strong className="text-zinc-400">Upload inteligente:</strong> arrastar e soltar fotos; IA (GPT-4o) sugere
            título e tags para busca nos EUA.
          </li>
          <li>
            <strong className="text-zinc-400">Tradução e gramática:</strong> descreva em PT ou EN — ao salvar, o
            servidor corrige e gera EN / PT / ES (OpenAI).
          </li>
          <li>
            <strong className="text-zinc-400">Stock e variantes:</strong> USD, lbs, polegadas (in), estoque e rótulo de
            variante.
          </li>
        </ul>
      </div>
      <CatalogProductList refreshToken={refreshToken} />
      <CatalogProductForm onProductsCreated={() => setRefreshToken((v) => v + 1)} />
      <QuoteRequestsList refreshToken={refreshToken} />
    </div>
  );
}
