import "client-only";

import { useMutation } from "@tanstack/react-query";

import { readImageDimensions } from "@/lib/image-utils";
import { compressImageToWebP } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import type {
  CommittedMediaItem,
  MediaAsset,
  MediaSelectionItem,
} from "@/modules/media/types";

export const useUploadMedia = () => {
  const trpc = useTRPC();
  const createPresignedUpload = useMutation(
    trpc.media.createPresignedUpload.mutationOptions(),
  );
  const registerAsset = useMutation(trpc.media.registerAsset.mutationOptions());

  const uploadFile = async ({
    file,
    folder,
    altText,
    onProgress,
  }: {
    file: File;
    folder: string;
    altText?: string | null;
    onProgress?: (progress: number) => void;
  }): Promise<MediaAsset> => {
    onProgress?.(2);

    const compressed = await compressImageToWebP(file);
    onProgress?.(15);

    const dimensions = await readImageDimensions(compressed);
    onProgress?.(20);

    const { uploadUrl, key, publicUrl } =
      await createPresignedUpload.mutateAsync({
        filename: compressed.name,
        mimeType: "image/webp",
        sizeBytes: compressed.size,
        folder,
      });

    await putFileToS3({
      file: compressed,
      uploadUrl,
      onProgress: (loaded, total) => {
        const ratio = total ? loaded / total : 0;
        onProgress?.(20 + Math.round(ratio * 70));
      },
    });

    onProgress?.(92);

    const asset = await registerAsset.mutateAsync({
      key,
      url: publicUrl,
      filename: compressed.name,
      mimeType: "image/webp",
      sizeBytes: compressed.size,
      width: dimensions.width || null,
      height: dimensions.height || null,
      altText: altText ?? null,
    });

    onProgress?.(100);

    return asset;
  };

  return { uploadFile };
};

export const useDeleteMedia = () => {
  const trpc = useTRPC();
  return useMutation(trpc.media.deleteAsset.mutationOptions());
};

/**
 * Resolves a MediaSelectionItem list into committed (uploaded) items.
 *
 * - `existing` items pass through unchanged.
 * - `pending` items are uploaded to S3 and registered in `mediaAssets`.
 *
 * The returned items preserve the input order and `localId`, so callers that
 * track per-item metadata (e.g. ProductImageDraft.position) can rejoin by id.
 *
 * Uploads happen sequentially to keep S3 / DB load predictable and to surface
 * errors deterministically. If any upload fails, the call rejects with the
 * underlying error and previously-committed items are NOT rolled back (the
 * mediaAssets rows exist but are unreferenced) — the form should pair this
 * with an orphan-cleanup step or let the next failed-submit retry overwrite.
 */
export const useCommitMedia = () => {
  const { uploadFile } = useUploadMedia();

  const commit = async ({
    items,
    folder,
    onItemProgress,
  }: {
    items: MediaSelectionItem[];
    folder: string;
    onItemProgress?: (localId: string, progress: number) => void;
  }): Promise<CommittedMediaItem[]> => {
    const results: CommittedMediaItem[] = [];

    for (const item of items) {
      if (item.kind === "existing") {
        results.push({
          localId: item.localId,
          assetId: item.assetId,
          url: item.url,
          filename: item.filename,
          altText: item.altText,
        });
        continue;
      }

      const asset = await uploadFile({
        file: item.file,
        folder,
        altText: item.altText,
        onProgress: (progress) => onItemProgress?.(item.localId, progress),
      });

      results.push({
        localId: item.localId,
        assetId: asset.id,
        url: asset.url,
        filename: asset.filename,
        altText: asset.altText,
      });
    }

    return results;
  };

  return { commit };
};

const putFileToS3 = ({
  file,
  uploadUrl,
  onProgress,
}: {
  file: File;
  uploadUrl: string;
  onProgress?: (loaded: number, total: number) => void;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(event.loaded, event.total);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Falha no upload (status ${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Falha no upload do arquivo"));
    xhr.onabort = () => reject(new Error("Upload cancelado"));

    xhr.send(file);
  });
};
