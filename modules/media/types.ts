import type { AppRouter, RouterOutput } from "@/trpc/routers/_app";
import type { inferRouterInputs } from "@trpc/server";

type RouterInput = inferRouterInputs<AppRouter>;

export type MediaAsset = RouterOutput["media"]["registerAsset"];

export type CreatePresignedUploadInput =
  RouterInput["media"]["createPresignedUpload"];
export type RegisterAssetInput = RouterInput["media"]["registerAsset"];
export type DeleteAssetInput = RouterInput["media"]["deleteAsset"];

/**
 * A user-facing selection: either references an already-uploaded asset, or
 * holds a local File that hasn't been uploaded yet. Pending items are turned
 * into real assets at form-submit time by `useCommitMedia`.
 */
export type MediaSelectionItem =
  | {
      kind: "existing";
      localId: string;
      assetId: string;
      url: string;
      filename: string;
      altText: string | null;
    }
  | {
      kind: "pending";
      localId: string;
      file: File;
      previewUrl: string;
      altText: string | null;
    };

export type CommittedMediaItem = {
  localId: string;
  assetId: string;
  url: string;
  filename: string;
  altText: string | null;
};

/** Helpers for converting MediaAsset <-> MediaSelectionItem */
export const fromExistingAsset = (asset: MediaAsset): MediaSelectionItem => ({
  kind: "existing",
  localId: asset.id,
  assetId: asset.id,
  url: asset.url,
  filename: asset.filename,
  altText: asset.altText,
});

export type ProductImageDraft = {
  localId: string;
  /** present once the underlying file has been uploaded */
  assetId: string | null;
  colorName: string | null;
  colorHex: string | null;
  altText: string | null;
  position: number;
  isPrimary: boolean;
};

export type ProductImageColorOption = {
  colorName: string;
  colorHex: string | null;
};

/** Focal point (percent, 0–100) used as `object-position` when cropped. */
export type FocalPoint = { x: number; y: number };

export type BannerImageValue = {
  desktop: MediaSelectionItem | null;
  mobile: MediaSelectionItem | null;
  /** Where the desktop image anchors when the hero crops it. */
  desktopFocal: FocalPoint;
  /** Where the mobile image anchors when the hero crops it. */
  mobileFocal: FocalPoint;
  altText: string | null;
  ctaUrl: string | null;
};
