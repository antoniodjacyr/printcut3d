export const supportedLocales = ["en", "pt", "es"] as const;

export type Locale = (typeof supportedLocales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  pt: "Português",
  es: "Español"
};

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  pt: "🇧🇷",
  es: "🇪🇸"
};

export const dictionary: Record<Locale, Record<string, string>> = {
  en: {
    navMarketplace: "Marketplace",
    navAdmin: "Seller Dashboard",
    navAbout: "About Us",
    heroTitle: "Global 3D & Laser Manufacturing Marketplace",
    heroBody: "Connect stores, customize products and scale manufacturing in the U.S. market."
  },
  pt: {
    navMarketplace: "Marketplace",
    navAdmin: "Painel do Vendedor",
    navAbout: "Quem Somos",
    heroTitle: "Marketplace global de manufatura 3D e Laser",
    heroBody: "Conecte lojas, personalize produtos e escale sua manufatura no mercado americano."
  },
  es: {
    navMarketplace: "Marketplace",
    navAdmin: "Panel del Vendedor",
    navAbout: "Quiénes Somos",
    heroTitle: "Marketplace global de manufactura 3D y Laser",
    heroBody: "Conecta tiendas, personaliza productos y escala tu manufactura en el mercado de EE. UU."
  }
};

export const getInitialLocale = (browserLang?: string): Locale => {
  if (!browserLang) return "en";
  const normalized = browserLang.toLowerCase();
  if (normalized.startsWith("pt")) return "pt";
  if (normalized.startsWith("es")) return "es";
  return "en";
};
