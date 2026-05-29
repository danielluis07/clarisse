"use client";

import { FocalPointPicker } from "@/components/media/focal-point-picker";
import { MediaUploader } from "@/components/media/media-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_FOCAL_POINT } from "@/modules/banners/hero-layout";
import type {
  BannerImageValue,
  MediaSelectionItem,
} from "@/modules/media/types";
import { useId } from "react";

const selectionPreviewUrl = (item: MediaSelectionItem | null) => {
  if (!item) return null;
  return item.kind === "existing" ? item.url : item.previewUrl;
};

export const BannerImageField = ({
  value,
  onChange,
  onAssetRemoved,
  showCta = true,
  showAltText = true,
  showFocalPicker = false,
  disabled,
  className,
}: {
  value: BannerImageValue;
  onChange: (next: BannerImageValue) => void;
  /** Fired when an existing desktop/mobile asset is removed/replaced. */
  onAssetRemoved?: (assetId: string) => void;
  showCta?: boolean;
  showAltText?: boolean;
  /** Show the focal point picker for each slot (used for cropping placements). */
  showFocalPicker?: boolean;
  disabled?: boolean;
  className?: string;
}) => {
  const id = useId();
  const altId = `${id}-banner-alt`;
  const ctaId = `${id}-banner-cta`;

  const emit = (patch: Partial<BannerImageValue>) => {
    onChange({ ...value, ...patch });
  };

  const desktopUrl = selectionPreviewUrl(value.desktop);
  const mobileUrl = selectionPreviewUrl(value.mobile);

  return (
    <div className={className}>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label className="text-sm">Imagem desktop</Label>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Home hero: recomendo 2400x1320 (proporção 20:11), mínimo 1800x990. A
            imagem é recortada nessa proporção — mantenha a área inferior
            esquerda livre para texto e CTA e ajuste o ponto focal abaixo.
          </p>
          <MediaUploader
            value={value.desktop ? [value.desktop] : []}
            onChange={(items) => {
              const next = items[0] ?? null;
              emit(
                next
                  ? { desktop: next }
                  : { desktop: null, desktopFocal: { ...DEFAULT_FOCAL_POINT } },
              );
            }}
            onAssetRemoved={onAssetRemoved}
            multiple={false}
            disabled={disabled}
            emptyTitle="Imagem desktop"
            emptyDescription="Imagem horizontal em proporção editorial ampla."
          />
          {showFocalPicker && desktopUrl && (
            <FocalPointPicker
              imageUrl={desktopUrl}
              alt="Imagem desktop do hero"
              value={value.desktopFocal}
              onChange={(desktopFocal) => emit({ desktopFocal })}
              disabled={disabled}
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm">Imagem mobile</Label>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Home hero mobile: recomendo 1080x1920 (proporção 9:16). Envie um
            corte vertical dedicado, não a mesma imagem desktop, e ajuste o ponto
            focal abaixo.
          </p>
          <MediaUploader
            value={value.mobile ? [value.mobile] : []}
            onChange={(items) => {
              const next = items[0] ?? null;
              emit(
                next
                  ? { mobile: next }
                  : { mobile: null, mobileFocal: { ...DEFAULT_FOCAL_POINT } },
              );
            }}
            onAssetRemoved={onAssetRemoved}
            multiple={false}
            disabled={disabled}
            emptyTitle="Imagem mobile"
            emptyDescription="Imagem vertical em proporção de tela cheia."
          />
          {showFocalPicker && mobileUrl && (
            <FocalPointPicker
              imageUrl={mobileUrl}
              alt="Imagem mobile do hero"
              value={value.mobileFocal}
              onChange={(mobileFocal) => emit({ mobileFocal })}
              disabled={disabled}
            />
          )}
        </div>
      </div>

      {(showAltText || showCta) && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {showAltText && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={altId} className="text-sm">
                Texto alternativo
              </Label>
              <Input
                id={altId}
                value={value.altText ?? ""}
                onChange={(event) =>
                  emit({ altText: event.target.value || null })
                }
                placeholder="Descreva o que aparece na imagem"
                disabled={disabled}
              />
            </div>
          )}

          {showCta && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={ctaId} className="text-sm">
                Link de destino
              </Label>
              <Input
                id={ctaId}
                value={value.ctaUrl ?? ""}
                onChange={(event) =>
                  emit({ ctaUrl: event.target.value || null })
                }
                placeholder="/colecoes/soft-tailoring"
                disabled={disabled}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
