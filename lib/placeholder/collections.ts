/**
 * Placeholder collection content for the storefront design pages. Mirrors the
 * shape the admin "Collections" area will eventually persist, so swapping this
 * for live data is mostly a fetch swap.
 */
export type PlaceholderCollection = {
  slug: string;
  name: string;
  eyebrow: string;
  tagline: string;
  description: string;
  image: string;
  imageAlt: string;
  productCount: number;
  season: string;
  highlights: string[];
  featured?: boolean;
};

export const placeholderCollections: PlaceholderCollection[] = [
  {
    slug: "inverno-2026",
    name: "Coleção Inverno 2026",
    eyebrow: "Coleção em destaque",
    tagline: "Camadas nobres para a estação fria",
    description:
      "A sofisticação encontra o conforto em peças cuidadosamente elaboradas para elevar seu estilo nesta temporada. De casacos luxuosos a tricôs aconchegantes, cada item é uma expressão de qualidade e design refinado.",
    image:
      "https://images.unsplash.com/photo-1702579450298-64d0c9f75a2d?q=80&w=1800&auto=format&fit=crop",
    imageAlt: "Editorial da Coleção Inverno 2026 da Clarisse",
    productCount: 24,
    season: "Inverno 2026",
    highlights: ["Lã merino italiana", "Caimento estruturado", "Edição limitada"],
    featured: true,
  },
  {
    slug: "soft-tailoring",
    name: "Soft Tailoring",
    eyebrow: "Alfaiataria leve",
    tagline: "Estrutura sem rigidez",
    description:
      "Alfaiataria repensada para o dia a dia: ombros desconstruídos, tecidos fluidos e um caimento que acompanha o movimento sem abrir mão da presença.",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1800&auto=format&fit=crop",
    imageAlt: "Modelo vestindo conjunto de alfaiataria leve",
    productCount: 18,
    season: "Atemporal",
    highlights: ["Ombro desconstruído", "Lã fria", "Forro respirável"],
  },
  {
    slug: "vestidos-minimais",
    name: "Vestidos Minimais",
    eyebrow: "Edição vestidos",
    tagline: "O essencial em uma só peça",
    description:
      "Silhuetas limpas em tons neutros, pensadas para resolver o look com uma única escolha. Do escritório ao jantar, sem esforço aparente.",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1800&auto=format&fit=crop",
    imageAlt: "Modelo vestindo vestido minimalista",
    productCount: 15,
    season: "Atemporal",
    highlights: ["Tecido com toque seco", "Modelagem fluida", "Tons neutros"],
  },
  {
    slug: "office-essentials",
    name: "Office Essentials",
    eyebrow: "Guarda-roupa de trabalho",
    tagline: "Uma base elegante para a semana",
    description:
      "Peças âncora que conversam entre si: a calça de alfaiataria, a camisa impecável, o blazer certo. Combinações que vestem a rotina com intenção.",
    image:
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1800&auto=format&fit=crop",
    imageAlt: "Composição de peças de trabalho da Clarisse",
    productCount: 21,
    season: "Atemporal",
    highlights: ["Combinações coordenadas", "Tecidos antivinco", "Cores que se somam"],
  },
  {
    slug: "edicao-noite",
    name: "Evening Edit",
    eyebrow: "Edição noite",
    tagline: "Sofisticação para depois do pôr do sol",
    description:
      "Caimentos fluidos, acabamentos discretos e brilho contido. Uma curadoria para os momentos em que a ocasião pede um pouco mais.",
    image:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1800&auto=format&fit=crop",
    imageAlt: "Modelo vestindo peça da edição noite",
    productCount: 12,
    season: "Festas",
    highlights: ["Cetim de seda", "Acabamento à mão", "Paleta profunda"],
  },
  {
    slug: "guarda-roupa-capsula",
    name: "Capsule Wardrobe",
    eyebrow: "Cápsula essencial",
    tagline: "Menos peças, mais combinações",
    description:
      "Uma seleção enxuta de básicos elevados que se multiplicam em looks. A prova de que um guarda-roupa intencional veste mais do que parece.",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1800&auto=format&fit=crop",
    imageAlt: "Peças básicas elevadas da cápsula Clarisse",
    productCount: 10,
    season: "Atemporal",
    highlights: ["Algodão pima", "Modelagem versátil", "Tons coringa"],
  },
];

export const getCollections = () => placeholderCollections;

export const getFeaturedCollection = () =>
  placeholderCollections.find((collection) => collection.featured) ??
  placeholderCollections[0];

export const getCollectionBySlug = (slug: string) =>
  placeholderCollections.find((collection) => collection.slug === slug);
