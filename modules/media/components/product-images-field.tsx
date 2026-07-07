"use client";

import { ArrowLeft, ArrowRight, Star, Trash2 } from "lucide-react";
import Image from "next/image";

import { MediaUploader } from "@/modules/media/components/media-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  ProductImageColorOption,
  MediaSelectionItem,
  ProductImageDraft,
} from "@/modules/media/types";

/**
 * A single product image slot pairs a `MediaSelectionItem` (which carries the
 * upload/existing state) with the per-product metadata (`position`, `isPrimary`).
 * Use `localId` as the join key between the selection and the draft.
 */
export type ProductImageSlot = {
  selection: MediaSelectionItem;
  draft: ProductImageDraft;
};

const reindex = (slots: ProductImageSlot[]): ProductImageSlot[] => {
  const hasPrimary = slots.some((slot) => slot.draft.isPrimary);
  return slots.map((slot, index) => ({
    selection: slot.selection,
    draft: {
      ...slot.draft,
      position: index,
      isPrimary: hasPrimary ? slot.draft.isPrimary : index === 0,
    },
  }));
};

export const ProductImagesField = ({
  value,
  onChange,
  onAssetRemoved,
  maxImages = 8,
  disabled,
  className,
  colorOptions = [],
}: {
  value: ProductImageSlot[];
  onChange: (value: ProductImageSlot[]) => void;
  onAssetRemoved?: (assetId: string) => void;
  maxImages?: number;
  disabled?: boolean;
  className?: string;
  colorOptions?: ProductImageColorOption[];
}) => {
  const selectionValue = value.map((slot) => slot.selection);

  const handleSelectionChange = (next: MediaSelectionItem[]) => {
    const slotByLocalId = new Map(
      value.map((slot) => [slot.selection.localId, slot]),
    );

    const updated: ProductImageSlot[] = next.map((selection) => {
      const existing = slotByLocalId.get(selection.localId);
      if (existing) {
        return { selection, draft: existing.draft };
      }
      return {
        selection,
        draft: {
          localId: selection.localId,
          assetId:
            selection.kind === "existing" ? selection.assetId : null,
          colorName: null,
          colorHex: null,
          altText: selection.altText,
          position: 0,
          isPrimary: false,
        },
      };
    });

    onChange(reindex(updated));
  };

  const updateDraft = (
    localId: string,
    patch: Partial<ProductImageDraft>,
  ) => {
    onChange(
      reindex(
        value.map((slot) =>
          slot.draft.localId === localId
            ? {
                selection:
                  patch.altText !== undefined
                    ? { ...slot.selection, altText: patch.altText }
                    : slot.selection,
                draft: { ...slot.draft, ...patch },
              }
            : slot,
        ),
      ),
    );
  };

  const setPrimary = (localId: string) => {
    onChange(
      reindex(
        value.map((slot) => ({
          selection: slot.selection,
          draft: { ...slot.draft, isPrimary: slot.draft.localId === localId },
        })),
      ),
    );
  };

  const move = (localId: string, direction: -1 | 1) => {
    const idx = value.findIndex((slot) => slot.draft.localId === localId);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= value.length) return;
    const next = [...value];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(reindex(next));
  };

  return (
    <MediaUploader
      value={selectionValue}
      onChange={handleSelectionChange}
      onAssetRemoved={onAssetRemoved}
      multiple
      maxFiles={maxImages}
      disabled={disabled}
      className={className}
      emptyTitle="Adicionar imagens do produto"
      emptyDescription={`Até ${maxImages} imagens. A primeira é usada como capa por padrão.`}
      renderItem={({ item, index, onRemove, disabled: itemDisabled }) => {
        const slot = value.find((s) => s.draft.localId === item.localId);
        if (!slot) return null;

        return (
          <ProductImageCard
            slot={slot}
            isFirst={index === 0}
            isLast={index === value.length - 1}
            disabled={itemDisabled}
            onMoveLeft={() => move(slot.draft.localId, -1)}
            onMoveRight={() => move(slot.draft.localId, 1)}
            onSetPrimary={() => setPrimary(slot.draft.localId)}
            onAltChange={(altText) =>
              updateDraft(slot.draft.localId, { altText })
            }
            colorOptions={colorOptions}
            onColorChange={(color) =>
              updateDraft(slot.draft.localId, {
                colorName: color?.colorName ?? null,
                colorHex: color?.colorHex ?? null,
              })
            }
            onRemove={onRemove}
          />
        );
      }}
    />
  );
};

const ProductImageCard = ({
  slot,
  isFirst,
  isLast,
  disabled,
  onMoveLeft,
  onMoveRight,
  onSetPrimary,
  onAltChange,
  colorOptions,
  onColorChange,
  onRemove,
}: {
  slot: ProductImageSlot;
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSetPrimary: () => void;
  onAltChange: (value: string | null) => void;
  colorOptions: ProductImageColorOption[];
  onColorChange: (value: ProductImageColorOption | null) => void;
  onRemove: () => void;
}) => {
  const previewUrl =
    slot.selection.kind === "existing"
      ? slot.selection.url
      : slot.selection.previewUrl;
  const filename =
    slot.selection.kind === "existing"
      ? slot.selection.filename
      : slot.selection.file.name;
  const isPending = slot.selection.kind === "pending";
  const allColorsValue = "__all_colors";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-2 transition-shadow",
        slot.draft.isPrimary && "ring-2 ring-primary/40",
      )}>
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        {slot.selection.kind === "existing" ? (
          <Image
            src={previewUrl}
            alt={slot.draft.altText ?? filename}
            fill
            sizes="(max-width: 768px) 50vw, 200px"
            className="object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={slot.draft.altText ?? filename}
            className="size-full object-cover"
          />
        )}
        {slot.draft.isPrimary && (
          <span className="absolute top-1.5 left-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
            Capa
          </span>
        )}
        {isPending && (
          <span className="absolute bottom-1.5 left-1.5 rounded-md bg-background/85 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur">
            Pendente
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-1">
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={disabled || isFirst}
            onClick={onMoveLeft}
            aria-label="Mover para a esquerda">
            <ArrowLeft />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={disabled || isLast}
            onClick={onMoveRight}
            aria-label="Mover para a direita">
            <ArrowRight />
          </Button>
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            variant={slot.draft.isPrimary ? "secondary" : "ghost"}
            size="icon-xs"
            disabled={disabled || slot.draft.isPrimary}
            onClick={onSetPrimary}
            aria-label="Definir como capa">
            <Star />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon-xs"
            disabled={disabled}
            onClick={onRemove}
            aria-label="Remover imagem">
            <Trash2 />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label
          htmlFor={`color-${slot.draft.localId}`}
          className="text-[11px] text-muted-foreground">
          Cor
        </Label>
        <Select
          value={slot.draft.colorName ?? allColorsValue}
          onValueChange={(value) => {
            const selected = colorOptions.find(
              (color) => color.colorName === value,
            );
            onColorChange(selected ?? null);
          }}
          disabled={disabled}>
          <SelectTrigger
            id={`color-${slot.draft.localId}`}
            size="sm"
            className="h-7 w-full text-xs">
            <SelectValue placeholder="Todas as cores" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={allColorsValue}>Todas as cores</SelectItem>
              {colorOptions.map((color) => (
                <SelectItem key={color.colorName} value={color.colorName}>
                  <span className="inline-flex min-w-0 items-center gap-2">
                    {color.colorHex && (
                      <span
                        aria-hidden="true"
                        className="size-3 shrink-0 rounded-full border border-border"
                        style={{ backgroundColor: color.colorHex }}
                      />
                    )}
                    <span className="truncate">{color.colorName}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label
          htmlFor={`alt-${slot.draft.localId}`}
          className="text-[11px] text-muted-foreground">
          Texto alternativo
        </Label>
        <Input
          id={`alt-${slot.draft.localId}`}
          value={slot.draft.altText ?? ""}
          onChange={(event) => onAltChange(event.target.value || null)}
          placeholder="Descreva a imagem"
          disabled={disabled}
          className="h-7 text-xs"
        />
      </div>
    </div>
  );
};
