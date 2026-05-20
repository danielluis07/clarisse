"use client";

import { Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { MAX_FILE_SIZE_BYTES } from "@/constants";
import { cn } from "@/lib/utils";
import type { MediaSelectionItem } from "@/modules/media/types";
import { ALLOWED_IMAGE_MIME_TYPES } from "@/modules/media/validations";

export type MediaUploaderProps = {
  value: MediaSelectionItem[];
  onChange: (items: MediaSelectionItem[]) => void;
  /**
   * Fired when an `existing` selection item is removed. The form should add
   * the `assetId` to a cleanup queue so the underlying S3 object can be
   * deleted *after* the parent entity has been saved without that reference.
   */
  onAssetRemoved?: (assetId: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
  accept?: readonly string[];
  disabled?: boolean;
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  /**
   * Custom rendering for a selection item. If omitted, a default preview with
   * a remove button is rendered.
   */
  renderItem?: (props: {
    item: MediaSelectionItem;
    index: number;
    onRemove: () => void;
    disabled: boolean;
  }) => React.ReactNode;
};

export const MediaUploader = ({
  value,
  onChange,
  onAssetRemoved,
  multiple = false,
  maxFiles,
  maxSizeBytes = MAX_FILE_SIZE_BYTES.value,
  accept = ALLOWED_IMAGE_MIME_TYPES,
  disabled = false,
  className,
  emptyTitle = "Arraste uma imagem ou clique para selecionar",
  emptyDescription,
  renderItem,
}: MediaUploaderProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );

  const effectiveMax = multiple ? (maxFiles ?? Infinity) : 1;
  const remainingSlots = Math.max(0, effectiveMax - value.length);
  const acceptAttr = accept.join(",");
  const maxSizeLabel = formatBytes(maxSizeBytes);

  // Revoke preview URLs for pending items that fall out of `value`.
  const previewUrlsRef = React.useRef<Set<string>>(new Set());
  React.useEffect(() => {
    const next = new Set<string>();
    value.forEach((item) => {
      if (item.kind === "pending") next.add(item.previewUrl);
    });
    previewUrlsRef.current.forEach((url) => {
      if (!next.has(url)) URL.revokeObjectURL(url);
    });
    previewUrlsRef.current = next;
  }, [value]);

  React.useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current = new Set();
    };
  }, []);

  const validateFile = (file: File): string | null => {
    if (!accept.includes(file.type)) {
      return "Tipo de arquivo não permitido";
    }
    if (file.size <= 0) return "Arquivo inválido";
    if (file.size > maxSizeBytes) {
      return `Arquivo muito grande (máx. ${maxSizeLabel})`;
    }
    return null;
  };

  const handleFiles = (files: FileList | File[] | null) => {
    if (!files || disabled) return;

    const filesArray = Array.from(files);
    if (!filesArray.length) return;

    setValidationError(null);

    if (!multiple) {
      // Replace any existing item — and queue cleanup for any existing asset.
      const file = filesArray[0];
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        return;
      }

      const previous = value[0];
      if (previous && previous.kind === "existing") {
        onAssetRemoved?.(previous.assetId);
      } else if (previous && previous.kind === "pending") {
        URL.revokeObjectURL(previous.previewUrl);
      }

      const pending: MediaSelectionItem = {
        kind: "pending",
        localId: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        altText: null,
      };
      onChange([pending]);
      return;
    }

    const accepted: MediaSelectionItem[] = [];
    for (const file of filesArray.slice(0, remainingSlots)) {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        continue;
      }
      accepted.push({
        kind: "pending",
        localId: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        altText: null,
      });
    }

    if (accepted.length) {
      onChange([...value, ...accepted]);
    }
  };

  const handleRemove = (item: MediaSelectionItem) => {
    if (disabled) return;
    if (item.kind === "existing") {
      onAssetRemoved?.(item.assetId);
    } else {
      URL.revokeObjectURL(item.previewUrl);
    }
    onChange(value.filter((existing) => existing.localId !== item.localId));
  };

  const openPicker = () => {
    if (disabled || remainingSlots <= 0) return;
    inputRef.current?.click();
  };

  const showDropzone = remainingSlots > 0;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        multiple={multiple}
        hidden
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {showDropzone && (
        <button
          type="button"
          onClick={openPicker}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
          disabled={disabled}
          className={cn(
            "group flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 px-4 py-8 text-sm text-muted-foreground transition-colors",
            "hover:border-ring hover:bg-muted/60",
            isDragging && "border-ring bg-muted/70 text-foreground",
            disabled && "pointer-events-none opacity-50",
          )}>
          <UploadCloud className="size-6" />
          <span className="font-medium text-foreground">{emptyTitle}</span>
          <span className="text-xs">
            {emptyDescription ??
              `JPG, PNG ou WEBP até ${maxSizeLabel}. As imagens são convertidas para WebP no envio.`}
          </span>
        </button>
      )}

      {validationError && (
        <p className="text-xs text-destructive">{validationError}</p>
      )}

      {value.length > 0 && (
        <div
          className={cn(
            "grid gap-3",
            multiple
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1",
          )}>
          {value.map((item, index) =>
            renderItem ? (
              <React.Fragment key={item.localId}>
                {renderItem({
                  item,
                  index,
                  onRemove: () => handleRemove(item),
                  disabled,
                })}
              </React.Fragment>
            ) : (
              <SelectionCard
                key={item.localId}
                item={item}
                onRemove={() => handleRemove(item)}
                disabled={disabled}
              />
            ),
          )}
        </div>
      )}

      {!showDropzone && (
        <p className="text-xs text-muted-foreground">
          Limite de {effectiveMax} imagem{effectiveMax === 1 ? "" : "ns"}{" "}
          atingido.
        </p>
      )}
    </div>
  );
};

const SelectionCard = ({
  item,
  onRemove,
  disabled,
}: {
  item: MediaSelectionItem;
  onRemove: () => void;
  disabled: boolean;
}) => {
  const previewUrl = item.kind === "existing" ? item.url : item.previewUrl;
  const altText =
    item.kind === "existing" ? (item.altText ?? item.filename) : item.file.name;

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
      {item.kind === "existing" ? (
        <Image
          src={previewUrl}
          alt={altText}
          fill
          sizes="(max-width: 768px) 50vw, 200px"
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
        disabled={disabled}
        aria-label="Remover imagem"
        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">
        <Trash2 />
      </Button>
    </div>
  );
};

const formatBytes = (bytes: number) => {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))}MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${bytes}B`;
};
