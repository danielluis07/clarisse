import type {
  BannerFormInput,
  BannerFormOutput,
} from "@/modules/banners/form-schema";
import type { BannerOutput } from "@/modules/banners/types";
import type {
  BannerImageValue,
  MediaSelectionItem,
} from "@/modules/media/types";

type BannerMediaAsset = NonNullable<BannerOutput["image"]>;

export const bannerBackHref = "/admin/banners";

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

const toSelectionItem = (
  asset: BannerMediaAsset | null | undefined,
): MediaSelectionItem | null => {
  if (!asset) return null;

  return {
    kind: "existing",
    localId: asset.id,
    assetId: asset.id,
    url: asset.url,
    filename: asset.filename,
    altText: asset.altText,
  };
};

export const getBannerFormDefaultValues = (
  banner?: BannerOutput,
): BannerFormInput => ({
  title: banner?.title ?? "",
  subtitle: banner?.subtitle ?? "",
  description: banner?.description ?? "",
  ctaLabel: banner?.ctaLabel ?? "",
  ctaUrl: banner?.ctaUrl ?? "",
  placement: banner?.placement ?? "home_hero",
  status: banner?.status ?? "draft",
  displayOrder: banner?.displayOrder ?? 0,
});

export const getBannerImageValue = (
  banner?: BannerOutput,
): BannerImageValue => ({
  desktop: toSelectionItem(banner?.image),
  mobile: toSelectionItem(banner?.mobileImage),
  altText: banner?.image?.altText ?? banner?.mobileImage?.altText ?? null,
  ctaUrl: banner?.ctaUrl ?? null,
});

export const getBannerFormErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Não foi possível salvar o banner.";

export const getBannerDeleteErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Não foi possível excluir o banner.";

export const withBannerUploadAltText = (
  item: MediaSelectionItem | null,
  altText: string | null,
): MediaSelectionItem | null => {
  if (!item || item.kind === "existing") return item;
  return { ...item, altText };
};
