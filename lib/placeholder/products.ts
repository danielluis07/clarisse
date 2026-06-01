import type { ProductCardColor } from "@/components/store/product-card";

/**
 * Placeholder catalogue used by the editorial/collection design pages while the
 * real merchandising data is wired up. Hrefs point at the existing
 * `/products/[slug]` route so the cards behave like the rest of the storefront.
 */
export type PlaceholderProduct = {
  slug: string;
  name: string;
  category: string;
  price: string;
  comparePrice?: string;
  image: string;
  hoverImage?: string;
  badge?: string;
  colors: ProductCardColor[];
};

const NEUTRALS: ProductCardColor[] = [
  { name: "Preto", hex: "#1c1c1c" },
  { name: "Areia", hex: "#cbb79c" },
  { name: "Marfim", hex: "#efe9df" },
  { name: "Caramelo", hex: "#a9743f" },
];

export const placeholderProducts: PlaceholderProduct[] = [
  {
    slug: "blazer-aurora",
    name: "Blazer Aurora",
    category: "Alfaiataria",
    price: "R$ 1.290",
    comparePrice: "R$ 1.590",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop",
    badge: "Edit",
    colors: NEUTRALS.slice(0, 3),
  },
  {
    slug: "calca-alta-margaux",
    name: "Calça Alta Margaux",
    category: "Alfaiataria",
    price: "R$ 890",
    image:
      "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=1200&auto=format&fit=crop",
    colors: NEUTRALS.slice(0, 2),
  },
  {
    slug: "vestido-minimal-leona",
    name: "Vestido Leona",
    category: "Vestidos",
    price: "R$ 1.120",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
    badge: "Novo",
    colors: [
      { name: "Marfim", hex: "#efe9df" },
      { name: "Preto", hex: "#1c1c1c" },
    ],
  },
  {
    slug: "camisa-oversized-elise",
    name: "Camisa Oversized Élise",
    category: "Camisas",
    price: "R$ 690",
    image:
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1200&auto=format&fit=crop",
    colors: NEUTRALS,
  },
  {
    slug: "trench-solene",
    name: "Trench Solène",
    category: "Casacos",
    price: "R$ 1.890",
    image:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=1200&auto=format&fit=crop",
    badge: "Edit",
    colors: [
      { name: "Areia", hex: "#cbb79c" },
      { name: "Caramelo", hex: "#a9743f" },
    ],
  },
  {
    slug: "saia-midi-colette",
    name: "Saia Midi Colette",
    category: "Saias",
    price: "R$ 740",
    image:
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1200&auto=format&fit=crop",
    colors: NEUTRALS.slice(1, 4),
  },
  {
    slug: "bolsa-estruturada-margot",
    name: "Bolsa Margot",
    category: "Bolsas",
    price: "R$ 1.450",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop",
    colors: [
      { name: "Caramelo", hex: "#a9743f" },
      { name: "Preto", hex: "#1c1c1c" },
    ],
  },
  {
    slug: "trico-merino-noa",
    name: "Tricô Merino Noa",
    category: "Malhas",
    price: "R$ 820",
    comparePrice: "R$ 980",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1200&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1200&auto=format&fit=crop",
    colors: NEUTRALS,
  },
];

/** Returns `count` placeholder products, cycling the list when needed. */
export const getPlaceholderProducts = (
  count: number,
  offset = 0,
): PlaceholderProduct[] =>
  Array.from(
    { length: count },
    (_, index) =>
      placeholderProducts[(offset + index) % placeholderProducts.length],
  );
