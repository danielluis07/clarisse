import type { BannerFormOutput } from "@/modules/banners/form-schema";

export const bannerPlacementLabels: Record<
  BannerFormOutput["placement"],
  string
> = {
  home_hero: "Hero da home",
  home_featured: "Destaque da home",
  collection_page: "Página de coleção",
  category_page: "Página de categoria",
  product_page: "Página de produto",
  promotional: "Promocional",
  editorial: "Editorial",
};

export const bannerStatusLabels: Record<BannerFormOutput["status"], string> = {
  draft: "Rascunho",
  active: "Ativo",
  archived: "Arquivado",
};
