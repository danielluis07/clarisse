"use client";

import { MediaUploader } from "@/components/media/media-uploader";
import type { MediaSelectionItem } from "@/modules/media/types";

export const CategoryImageField = ({
  value,
  onChange,
  onAssetRemoved,
  disabled,
  className,
}: {
  value: MediaSelectionItem | null;
  onChange: (value: MediaSelectionItem | null) => void;
  /** Called when an existing asset is removed/replaced — queue cleanup. */
  onAssetRemoved?: (assetId: string) => void;
  disabled?: boolean;
  className?: string;
}) => {
  return (
    <MediaUploader
      value={value ? [value] : []}
      onChange={(items) => onChange(items[0] ?? null)}
      onAssetRemoved={onAssetRemoved}
      multiple={false}
      disabled={disabled}
      className={className}
      emptyTitle="Imagem da categoria"
      emptyDescription="Use uma imagem horizontal para destaque na navegação."
    />
  );
};
