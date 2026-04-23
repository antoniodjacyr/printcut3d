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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallback;
  }

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

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }]
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as ProductLanguageResult;
    const hasAllLocales = supportedLocales.every((locale) => parsed.title?.[locale] && parsed.description?.[locale]);
    if (!hasAllLocales) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}
