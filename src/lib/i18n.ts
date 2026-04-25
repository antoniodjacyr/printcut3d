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
    navCart: "Cart",
    navMyAccount: "My account",
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
    productView: "View product",
    productBack: "Back to catalog",
    productMaterial: "Material",
    productWeight: "Weight",
    productDimensions: "Dimensions (L × W × H)",
    productCustomization: "Customization",
    productYes: "Yes",
    productNo: "No",
    productPreviewLabel: "Engraving preview (simulated)",
    productCheckoutSoon: "Checkout coming soon",
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
    loginTitle: "Sign in",
    loginSubtitle: "Seller dashboard — use the email and password from Supabase Auth.",
    loginEmail: "Email",
    loginPassword: "Password",
    loginSubmit: "Sign in",
    loginLoading: "Signing in…",
    loginError: "Could not sign in. Check your credentials.",
    loginEnvMissing:
      "Supabase is not fully configured on this deployment: add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY under Cloudflare Pages → Settings → Environment variables, then trigger a new deployment.",
    loginEnvPublishable:
      "This build uses a publishable key (sb_publishable…). If authentication fails with “Invalid API key”, set NEXT_PUBLIC_SUPABASE_ANON_KEY to the legacy anon JWT (starts with eyJ…) from Supabase → Project Settings → API, then redeploy.",
    loginEnvOtherKey:
      "The anon key does not look like a standard JWT. Make sure you copied the anon public key from Supabase → API, not the service_role secret.",
    loginErrInvalidKey:
      "Invalid Supabase API key. In Cloudflare Pages, set NEXT_PUBLIC_SUPABASE_ANON_KEY to the anon public JWT (eyJ…) from Supabase → Project Settings → API, save, redeploy, and try again.",
    loginErrBadCredentials: "Wrong email or password.",
    loginErrConfirmEmail:
      "This account’s email is not confirmed yet. Open the Supabase confirmation link from your inbox (and spam), or in Supabase go to Authentication → Users → your user → confirm manually. For testing only: Authentication → Providers → Email → turn off “Confirm email”.",
    loginErrGeneric: "Could not sign in.",
    loginHelpToggle: "Still stuck? Checklist",
    loginHelpL1:
      "Supabase → Authentication → URL Configuration: Site URL https://printcut3d.com and redirect https://printcut3d.com/**",
    loginHelpL2: "If “Confirm email” is enabled, confirm the user inbox or turn it off temporarily for testing.",
    loginHelpL3: "Prefer the legacy anon JWT (eyJ…) in NEXT_PUBLIC_SUPABASE_ANON_KEY when publishable keys cause errors.",
    loginSignupTab: "Create account",
    loginSignupSubmit: "Create account",
    loginSignupConfirmPassword: "Confirm password",
    loginSignupPasswordMismatch: "Passwords do not match.",
    loginSignupPasswordTooShort: "Password must be at least 6 characters.",
    loginSignupSuccess: "Account created. Check your email to confirm, then sign in.",
    loginSignupFirstName: "First name",
    loginSignupLastName: "Last name",
    loginSignupPhone: "Phone",
    loginSignupAddress1: "Address line 1",
    loginSignupAddress2: "Address line 2",
    loginSignupCity: "City",
    loginSignupState: "State",
    loginSignupCountry: "Country",
    dashBrandLabel: "PrintCut3D",
    dashHeading: "Dashboard",
    dashTagline:
      "Overview, catalog, production, shipping, finance, reviews, marketing, and content — KPIs load on the server; charts update in the browser.",
    dashBackSite: "Back to site",
    dashNavOverview: "Overview",
    dashNavCatalog: "Catalog",
    dashNavPipeline: "Production",
    dashNavShipping: "Shipping",
    dashNavFinance: "Finance",
    dashNavReviews: "Reviews",
    dashNavMarketing: "Marketing",
    dashNavContent: "Content"
  },
  pt: {
    navMarketplace: "Loja",
    navCart: "Carrinho",
    navMyAccount: "Minha conta",
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
    productView: "Ver produto",
    productBack: "Voltar ao catálogo",
    productMaterial: "Material",
    productWeight: "Peso",
    productDimensions: "Dimensões (C × L × A)",
    productCustomization: "Personalização",
    productYes: "Sim",
    productNo: "Não",
    productPreviewLabel: "Prévia da gravação (simulada)",
    productCheckoutSoon: "Checkout em breve",
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
    loginTitle: "Entrar",
    loginSubtitle: "Painel do vendedor — use o e-mail e a senha do Supabase Auth.",
    loginEmail: "E-mail",
    loginPassword: "Senha",
    loginSubmit: "Entrar",
    loginLoading: "Entrando…",
    loginError: "Não foi possível entrar. Verifique e-mail e senha.",
    loginEnvMissing:
      "Supabase incompleto neste deploy: em Cloudflare Pages → Settings → Environment variables, defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY e faça um novo deploy.",
    loginEnvPublishable:
      "Este build usa chave publishable (sb_publishable…). Se aparecer “Invalid API key”, use o JWT anon legado (começa com eyJ…) em NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase → Project Settings → API) e faça redeploy.",
    loginEnvOtherKey:
      "A chave anon não parece um JWT padrão. Confira se copiou a chave anon pública em API, não a service_role.",
    loginErrInvalidKey:
      "Chave de API do Supabase inválida. No Cloudflare Pages, defina NEXT_PUBLIC_SUPABASE_ANON_KEY como o JWT anon público (eyJ…) em Supabase → Project Settings → API, salve, redeploy e tente de novo.",
    loginErrBadCredentials: "E-mail ou senha incorretos.",
    loginErrConfirmEmail:
      "Este e-mail ainda não foi confirmado. Abra o link de confirmação que o Supabase enviou (verifique spam), ou em Supabase: Authentication → Users → seu utilizador → confirmar manualmente. Só para testes: Authentication → Providers → Email → desligar “Confirm email”.",
    loginErrGeneric: "Não foi possível entrar.",
    loginHelpToggle: "Ainda com problema? Checklist",
    loginHelpL1:
      "Supabase → Authentication → URL Configuration: Site URL https://printcut3d.com e redirect https://printcut3d.com/**",
    loginHelpL2: "Com “Confirmar e-mail” ativo, confirme o usuário ou desative temporariamente para testes.",
    loginHelpL3: "Prefira o JWT anon legado (eyJ…) em NEXT_PUBLIC_SUPABASE_ANON_KEY se a chave publishable falhar.",
    loginSignupTab: "Criar conta",
    loginSignupSubmit: "Criar conta",
    loginSignupConfirmPassword: "Confirmar senha",
    loginSignupPasswordMismatch: "As senhas não coincidem.",
    loginSignupPasswordTooShort: "A senha deve ter no mínimo 6 caracteres.",
    loginSignupSuccess: "Conta criada. Confira seu e-mail para confirmar e depois faça login.",
    loginSignupFirstName: "Nome",
    loginSignupLastName: "Sobrenome",
    loginSignupPhone: "Telefone",
    loginSignupAddress1: "Endereço",
    loginSignupAddress2: "Complemento",
    loginSignupCity: "Cidade",
    loginSignupState: "Estado",
    loginSignupCountry: "País",
    dashBrandLabel: "PrintCut3D",
    dashHeading: "Painel",
    dashTagline:
      "Visão geral, catálogo, produção, logística, financeiro, reviews, marketing e conteúdo — KPIs no servidor; gráficos ao vivo no navegador.",
    dashBackSite: "Voltar ao site",
    dashNavOverview: "Visão geral",
    dashNavCatalog: "Catálogo",
    dashNavPipeline: "Produção",
    dashNavShipping: "Logística",
    dashNavFinance: "Financeiro",
    dashNavReviews: "Reviews",
    dashNavMarketing: "Marketing",
    dashNavContent: "Conteúdo"
  },
  es: {
    navMarketplace: "Tienda",
    navCart: "Carrito",
    navMyAccount: "Mi cuenta",
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
    productView: "Ver producto",
    productBack: "Volver al catálogo",
    productMaterial: "Material",
    productWeight: "Peso",
    productDimensions: "Dimensiones (L × A × P)",
    productCustomization: "Personalización",
    productYes: "Sí",
    productNo: "No",
    productPreviewLabel: "Vista previa del grabado (simulada)",
    productCheckoutSoon: "Checkout próximamente",
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
    loginTitle: "Iniciar sesión",
    loginSubtitle: "Panel del vendedor — usa el correo y la contraseña de Supabase Auth.",
    loginEmail: "Correo",
    loginPassword: "Contraseña",
    loginSubmit: "Entrar",
    loginLoading: "Iniciando sesión…",
    loginError: "No se pudo iniciar sesión. Revisa tus datos.",
    loginEnvMissing:
      "Supabase no está completo en este deploy: en Cloudflare Pages → Settings → Environment variables, añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY y vuelve a desplegar.",
    loginEnvPublishable:
      "Este build usa clave publishable (sb_publishable…). Si ves “Invalid API key”, pon NEXT_PUBLIC_SUPABASE_ANON_KEY con el JWT anon legacy (empieza por eyJ…) en Supabase → Project Settings → API y redeploy.",
    loginEnvOtherKey:
      "La clave anon no parece un JWT estándar. Copia la clave anon pública en API, no el secreto service_role.",
    loginErrInvalidKey:
      "Clave de API de Supabase inválida. En Cloudflare Pages, define NEXT_PUBLIC_SUPABASE_ANON_KEY como el JWT anon público (eyJ…) en Supabase → Project Settings → API, guarda, redeploy e inténtalo de nuevo.",
    loginErrBadCredentials: "Correo o contraseña incorrectos.",
    loginErrConfirmEmail:
      "Este correo aún no está confirmado. Abre el enlace de confirmación del correo (revisa spam), o en Supabase: Authentication → Users → tu usuario → confirmar manualmente. Solo pruebas: Authentication → Providers → Email → desactivar “Confirm email”.",
    loginErrGeneric: "No se pudo iniciar sesión.",
    loginHelpToggle: "¿Sigue fallando? Lista de comprobación",
    loginHelpL1:
      "Supabase → Authentication → URL Configuration: Site URL https://printcut3d.com y redirect https://printcut3d.com/**",
    loginHelpL2: "Si “Confirmar correo” está activo, confirma el usuario o desactívalo temporalmente para pruebas.",
    loginHelpL3: "Prefiere el JWT anon legacy (eyJ…) en NEXT_PUBLIC_SUPABASE_ANON_KEY si las claves publishable fallan.",
    loginSignupTab: "Crear cuenta",
    loginSignupSubmit: "Crear cuenta",
    loginSignupConfirmPassword: "Confirmar contraseña",
    loginSignupPasswordMismatch: "Las contraseñas no coinciden.",
    loginSignupPasswordTooShort: "La contraseña debe tener al menos 6 caracteres.",
    loginSignupSuccess: "Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.",
    loginSignupFirstName: "Nombre",
    loginSignupLastName: "Apellido",
    loginSignupPhone: "Teléfono",
    loginSignupAddress1: "Dirección",
    loginSignupAddress2: "Complemento",
    loginSignupCity: "Ciudad",
    loginSignupState: "Estado",
    loginSignupCountry: "País",
    dashBrandLabel: "PrintCut3D",
    dashHeading: "Panel",
    dashTagline:
      "Resumen, catálogo, producción, envíos, finanzas, reseñas, marketing y contenido — KPIs en el servidor; gráficos en vivo en el navegador.",
    dashBackSite: "Volver al sitio",
    dashNavOverview: "Resumen",
    dashNavCatalog: "Catálogo",
    dashNavPipeline: "Producción",
    dashNavShipping: "Logística",
    dashNavFinance: "Finanzas",
    dashNavReviews: "Reseñas",
    dashNavMarketing: "Marketing",
    dashNavContent: "Contenido"
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
