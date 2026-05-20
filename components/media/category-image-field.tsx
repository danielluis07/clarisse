"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";

import { MediaUploader } from "@/components/media/media-uploader";
import { Button } from "@/components/ui/button";
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
      renderItem={({ item, onRemove, disabled: isItemDisabled }) => {
        const previewUrl =
          item.kind === "existing" ? item.url : item.previewUrl;
        const altText =
          item.kind === "existing"
            ? (item.altText ?? item.filename)
            : item.file.name;

        return (
          <div className="group relative h-36 w-36 overflow-hidden rounded-lg border bg-muted">
            {item.kind === "existing" ? (
              <Image
                src={previewUrl}
                alt={altText}
                fill
                sizes="144px"
                className="object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={altText}
                className="size-full object-cover"
              />
            )}
            {item.kind === "pending" && (
              <span className="absolute bottom-1.5 left-1.5 rounded-md bg-background/85 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur">
                Pendente
              </span>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              onClick={onRemove}
              disabled={isItemDisabled}
              aria-label="Remover imagem"
              className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">
              <Trash2 />
            </Button>
          </div>
        );
      }}
    />
  );
};
