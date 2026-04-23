import type { Locale } from "@/lib/i18n";

export type LocalizedCopy = Record<Locale, string>;

export type MockProduct = {
  slug: string;
  title: LocalizedCopy;
  shortBadge: LocalizedCopy;
  description: LocalizedCopy;
  material: LocalizedCopy;
  priceUsd: number;
  weightLbs: number;
  dimensionsIn: { width: number; height: number; depth: number };
  hasCustomization: boolean;
};

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    slug: "petg-housing-kit",
    title: {
      en: "PETG housing kit",
      pt: "Kit de carcaça PETG",
      es: "Kit carcasa PETG"
    },
    shortBadge: {
      en: "Made-to-order",
      pt: "Sob encomenda",
      es: "Bajo pedido"
    },
    description: {
      en: "Two-part enclosure with screw bosses and vent slots. Ideal for electronics prototypes and small production runs.",
      pt: "Caixa em duas partes com ilhós para parafusos e aberturas de ventilação. Ideal para protótipos eletrônicos e pequenas séries.",
      es: "Carcasa en dos partes con insertos para tornillos y ranuras de ventilación. Ideal para prototipos electrónicos y tiradas cortas."
    },
    material: {
      en: "PETG — temperature resistant, low warp",
      pt: "PETG — resistente a temperatura, baixa deformação",
      es: "PETG — resistente a temperatura, poca deformación"
    },
    priceUsd: 48,
    weightLbs: 0.42,
    dimensionsIn: { width: 4.25, height: 2.75, depth: 1.1 },
    hasCustomization: true
  },
  {
    slug: "laser-desk-organizer",
    title: {
      en: "Laser desk organizer",
      pt: "Organizador de mesa (laser)",
      es: "Organizador de escritorio (láser)"
    },
    shortBadge: {
      en: "Engravable",
      pt: "Gravável",
      es: "Grabable"
    },
    description: {
      en: "Matte black acrylic with laser-etched grid and pen slots. Optional custom text on the front rail.",
      pt: "Acrílico preto fosco com grade gravada a laser e slots para canetas. Texto opcional na frente.",
      es: "Acrílico negro mate con rejilla grabada láser y ranuras para bolígrafos. Texto opcional en el frente."
    },
    material: {
      en: "3/16 in cast acrylic",
      pt: "Acrílico fundido 3/16 pol",
      es: "Acrílico colado 3/16 in"
    },
    priceUsd: 36,
    weightLbs: 0.28,
    dimensionsIn: { width: 12, height: 4.5, depth: 5.25 },
    hasCustomization: true
  },
  {
    slug: "jig-plate-abs",
    title: {
      en: "Jig plate (ABS)",
      pt: "Placa gabarito (ABS)",
      es: "Placa utillaje (ABS)"
    },
    shortBadge: {
      en: "Production",
      pt: "Produção",
      es: "Producción"
    },
    description: {
      en: "Rigid ABS plate with indexed holes for repeat assembly fixtures. Ships sanded and deburred.",
      pt: "Placa rígida em ABS com furos indexados para gabaritos de montagem. Envio lixado e sem rebarbas.",
      es: "Placa rígida ABS con agujeros indexados para utillajes de ensamblaje. Envío lijado y sin rebabas."
    },
    material: {
      en: "ABS — impact resistant",
      pt: "ABS — resistente a impacto",
      es: "ABS — resistente a impactos"
    },
    priceUsd: 62,
    weightLbs: 0.95,
    dimensionsIn: { width: 8, height: 8, depth: 0.5 },
    hasCustomization: false
  }
];

export function getMockProductBySlug(slug: string): MockProduct | undefined {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export function getAllMockProductSlugs(): string[] {
  return MOCK_PRODUCTS.map((p) => p.slug);
}
