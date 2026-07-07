import type { StoreCollection } from "@/modules/collections/types";

const fallbackImages = [
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=2400&auto=format&fit=crop",
] as const;

export const formatPieceCount = (count: number) =>
  `${count} ${count === 1 ? "peça" : "peças"}`;

export const getCollectionDescription = (collection: StoreCollection) =>
  collection.description ??
  "Uma curadoria Clarisse de peças essenciais, proporções precisas e materiais pensados para acompanhar a rotina com presença.";

export const getCollectionImage = (collection: StoreCollection) => ({
  src:
    collection.image?.url ??
    fallbackImages[collection.displayOrder % fallbackImages.length],
  alt: collection.image?.altText ?? `Editorial da coleção ${collection.name}`,
});

export const getCollectionEyebrow = (collection: StoreCollection) =>
  collection.isFeatured ? "Coleção em destaque" : "Coleção Clarisse";

export const getCollectionHighlights = (collection: StoreCollection) => [
  collection.isFeatured
    ? "Curadoria principal da temporada"
    : "Seleção editorial da Clarisse",
  "Alfaiataria, textura e proporção em equilíbrio",
  `${formatPieceCount(collection.productCount)} disponíveis`,
];
