import OpenAI from "openai";
import { Locale, supportedLocales } from "@/lib/i18n";

type LocalizedText = Record<Locale, string>;

type ProductLanguageResult = {
  title: LocalizedText;
  description: LocalizedText;
};

const normalizeLocale = (value: string): Locale => {
  const normalized = value.toLowerCase();
  if (normalized.startsWith("pt")) return "pt";
  if (normalized.startsWith("es")) return "es";
  return "en";
};

export async function buildLocalizedProductText(params: {
  originalLanguage: string;
  title: string;
  description: string;
}): Promise<ProductLanguageResult> {
  const sourceLocale = normalizeLocale(params.originalLanguage);
  const fallback: ProductLanguageResult = {
    title: { en: params.title, pt: params.title, es: params.title },
    description: { en: params.description, pt: params.description, es: params.description }
  };

  if (!process.env.OPENAI_API_KEY) {
    return fallback;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const targetLocales = supportedLocales.filter((locale) => locale !== sourceLocale);

  const prompt = `You are a senior localization and copy editor for an e-commerce marketplace.
Return only valid JSON in this shape:
{
  "title": { "en": "...", "pt": "...", "es": "..." },
  "description": { "en": "...", "pt": "...", "es": "..." }
}

Rules:
- Correct grammar and spelling in the source text before translation.
- Keep technical manufacturing terms natural for U.S. market and global customers.
- Do not add marketing fluff not present in source.
- Maintain meaning and product details.

Source language: ${sourceLocale}
Source title: ${params.title}
Source description: ${params.description}
Required target locales: ${targetLocales.join(", ")}`;

  const response = await client.responses.create({
    model: "gpt-4o",
    input: prompt,
    temperature: 0.2
  });

  const raw = response.output_text?.trim();
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as ProductLanguageResult;
    const hasAllLocales = supportedLocales.every((locale) => parsed.title?.[locale] && parsed.description?.[locale]);
    if (!hasAllLocales) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}
