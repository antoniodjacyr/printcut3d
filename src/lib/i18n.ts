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
    navMarketplace: "Shop",
    navAdmin: "Admin",
    navAbout: "About Us",
    navLogin: "Sign in",
    navLogout: "Sign out",
    heroTitle: "Global 3D & Laser Manufacturing Marketplace",
    heroBody: "Connect stores, customize products and scale manufacturing in the U.S. market.",
    homeBadge: "Precision engineering & artisan finish",
    homeHeadline: "Custom 3D prints & laser work — built for the U.S. market",
    homeSub:
      "From prototypes to production runs: durable materials, imperial measurements, and checkout-ready fulfillment.",
    ctaShop: "Browse catalog",
    ctaQuote: "Request a quote",
    ctaSeller: "Seller login",
    trustShip: "US fulfillment",
    trustPay: "Secure checkout",
    trustLang: "EN / PT / ES",
    sectionCats: "What we manufacture",
    cat3dTitle: "3D printing",
    cat3dBody: "Functional parts, jigs, housings, and end-use goods in engineered plastics.",
    catLaserTitle: "Laser cutting & engraving",
    catLaserBody: "Acrylic, wood, and metal marking — crisp edges and repeatable batches.",
    catCustomTitle: "Customization",
    catCustomBody: "Text engraving previews and made-to-order finishes for your brand.",
    sectionSoon: "Marketplace launch",
    sectionSoonBody: "Seller onboarding, Stripe Connect split payouts, and live inventory are shipping next.",
    footerTag: "Print & Cut 3D — American manufacturing, global reach.",
    loginTitle: "Seller sign-in",
    loginSubtitle: "Use the email and password configured in Supabase Auth.",
    loginEmail: "Email",
    loginPassword: "Password",
    loginSubmit: "Sign in",
    loginError: "Could not sign in. Check your credentials.",
    loginHint:
      "If it still fails: (1) Supabase → Authentication → URL Configuration → set Site URL to https://printcut3d.com and add redirect https://printcut3d.com/** (2) If “Confirm email” is on, confirm the user’s inbox or disable for testing. (3) Use the legacy anon JWT (eyJ…) in NEXT_PUBLIC_SUPABASE_ANON_KEY if you use sb_publishable keys."
  },
  pt: {
    navMarketplace: "Loja",
    navAdmin: "Admin",
    navAbout: "Quem Somos",
    navLogin: "Entrar",
    navLogout: "Sair",
    heroTitle: "Marketplace global de manufatura 3D e Laser",
    heroBody: "Conecte lojas, personalize produtos e escale sua manufatura no mercado americano.",
    homeBadge: "Engenharia de precisão & acabamento artesanal",
    homeHeadline: "Impressão 3D e laser sob medida — foco no mercado americano",
    homeSub:
      "Do protótipo à produção: materiais robustos, medidas imperiais e logística pronta para venda online.",
    ctaShop: "Ver catálogo",
    ctaQuote: "Solicitar orçamento",
    ctaSeller: "Área do vendedor",
    trustShip: "Envio nos EUA",
    trustPay: "Checkout seguro",
    trustLang: "EN / PT / ES",
    sectionCats: "O que fabricamos",
    cat3dTitle: "Impressão 3D",
    cat3dBody: "Peças funcionais, gabaritos, carcaças e peças finais em termoplásticos de engenharia.",
    catLaserTitle: "Corte e gravação a laser",
    catLaserBody: "Acrílico, madeira e marcação em metal — bordas limpas e lotes repetíveis.",
    catCustomTitle: "Personalização",
    catCustomBody: "Pré-visualização de gravação e acabamentos sob medida para sua marca.",
    sectionSoon: "Lançamento do marketplace",
    sectionSoonBody: "Onboarding de vendedores, repasses Stripe Connect e estoque ao vivo chegam em breve.",
    footerTag: "Print & Cut 3D — manufatura americana, alcance global.",
    loginTitle: "Acesso do vendedor",
    loginSubtitle: "Use o e-mail e a senha criados no Supabase Auth.",
    loginEmail: "E-mail",
    loginPassword: "Senha",
    loginSubmit: "Entrar",
    loginError: "Não foi possível entrar. Verifique e-mail e senha.",
    loginHint:
      "Se continuar falhando: (1) Supabase → Authentication → URL Configuration → Site URL = https://printcut3d.com e redirect https://printcut3d.com/** (2) Se “Confirmar e-mail” estiver ativo, confirme o e-mail do usuário ou desative para testes. (3) Coloque o anon JWT antigo (eyJ…) em NEXT_PUBLIC_SUPABASE_ANON_KEY se estiver usando chave sb_publishable."
  },
  es: {
    navMarketplace: "Tienda",
    navAdmin: "Admin",
    navAbout: "Quiénes Somos",
    navLogin: "Iniciar sesión",
    navLogout: "Salir",
    heroTitle: "Marketplace global de manufactura 3D y Laser",
    heroBody: "Conecta tiendas, personaliza productos y escala tu manufactura en el mercado de EE. UU.",
    homeBadge: "Ingeniería de precisión y acabado artesanal",
    homeHeadline: "Impresión 3D y láser a medida — para el mercado de EE. UU.",
    homeSub:
      "Del prototipo a la producción: materiales resistentes, medidas imperiales y logística lista para venta.",
    ctaShop: "Ver catálogo",
    ctaQuote: "Solicitar cotización",
    ctaSeller: "Acceso vendedores",
    trustShip: "Fulfillment en EE. UU.",
    trustPay: "Pago seguro",
    trustLang: "EN / PT / ES",
    sectionCats: "Qué fabricamos",
    cat3dTitle: "Impresión 3D",
    cat3dBody: "Piezas funcionales, utillajes, carcasas y piezas finales en termoplásticos de ingeniería.",
    catLaserTitle: "Corte y grabado láser",
    catLaserBody: "Acrílico, madera y marcado en metal — bordes nítidos y lotes repetibles.",
    catCustomTitle: "Personalización",
    catCustomBody: "Vista previa de grabado y acabados bajo pedido para tu marca.",
    sectionSoon: "Lanzamiento del marketplace",
    sectionSoonBody: "Onboarding de vendedores, pagos divididos con Stripe Connect e inventario en vivo, próximamente.",
    footerTag: "Print & Cut 3D — manufactura estadounidense, alcance global.",
    loginTitle: "Acceso vendedores",
    loginSubtitle: "Usa el correo y la contraseña configurados en Supabase Auth.",
    loginEmail: "Correo",
    loginPassword: "Contraseña",
    loginSubmit: "Entrar",
    loginError: "No se pudo iniciar sesión. Revisa tus datos.",
    loginHint:
      "Si sigue fallando: (1) Supabase → Authentication → URL Configuration → Site URL https://printcut3d.com y redirect https://printcut3d.com/** (2) Si “Confirmar correo” está activo, confirma el email o desactívalo para pruebas. (3) Usa el anon JWT legacy (eyJ…) en NEXT_PUBLIC_SUPABASE_ANON_KEY si usas claves sb_publishable."
  }
};

export const aboutDictionary: Record<
  Locale,
  { title: string; blocks: Array<{ title: string; body: string }> }
> = {
  en: {
    title: "About Print & Cut 3D",
    blocks: [
      {
        title: "Our story",
        body: "We started as a precision shop serving creators and small businesses who needed dependable 3D printing and laser finishing — without the usual delays and guesswork."
      },
      {
        title: "What we believe",
        body: "Transparent pricing in USD, imperial measurements by default, and tooling that scales from one-off gifts to repeatable production."
      },
      {
        title: "Where we are going",
        body: "The marketplace connects verified sellers with U.S. buyers, powered by Stripe Connect, Supabase-backed catalogs, and AI-assisted translations for EN, PT, and ES."
      }
    ]
  },
  pt: {
    title: "Quem somos — Print & Cut 3D",
    blocks: [
      {
        title: "Nossa história",
        body: "Começamos como oficina de precisão atendendo criadores e PMEs que precisavam de impressão 3D e acabamento a laser confiáveis — sem atrasos e sem improviso."
      },
      {
        title: "O que defendemos",
        body: "Preço transparente em USD, medidas imperiais por padrão e processos que escalam de um brinde único a produção em série."
      },
      {
        title: "Para onde vamos",
        body: "O marketplace conecta vendedores verificados a compradores nos EUA, com Stripe Connect, catálogo no Supabase e traduções assistidas por IA em EN, PT e ES."
      }
    ]
  },
  es: {
    title: "Quiénes somos — Print & Cut 3D",
    blocks: [
      {
        title: "Nuestra historia",
        body: "Empezamos como taller de precisión para creadores y pymes que necesitaban impresión 3D y acabado láser confiables — sin demoras ni incertidumbre."
      },
      {
        title: "Lo que creemos",
        body: "Precios transparentes en USD, medidas imperiales por defecto y procesos que escalan desde un regalo único hasta producción repetible."
      },
      {
        title: "Hacia dónde vamos",
        body: "El marketplace conecta vendedores verificados con compradores en EE. UU., con Stripe Connect, catálogo respaldado por Supabase y traducciones asistidas por IA."
      }
    ]
  }
};

export const getInitialLocale = (browserLang?: string): Locale => {
  if (!browserLang) return "en";
  const normalized = browserLang.toLowerCase();
  if (normalized.startsWith("pt")) return "pt";
  if (normalized.startsWith("es")) return "es";
  return "en";
};
