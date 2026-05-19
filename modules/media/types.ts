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
  altText: string | null;
  position: number;
  isPrimary: boolean;
};

export type BannerImageValue = {
  desktop: MediaSelectionItem | null;
  mobile: MediaSelectionItem | null;
  altText: string | null;
  ctaUrl: string | null;
};
