"use client";

import { MediaUploader } from "@/components/media/media-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BannerImageValue } from "@/modules/media/types";

export const BannerImageField = ({
  value,
  onChange,
  onAssetRemoved,
  showCta = true,
  showAltText = true,
  disabled,
  className,
}: {
  value: BannerImageValue;
  onChange: (next: BannerImageValue) => void;
  /** Fired when an existing desktop/mobile asset is removed/replaced. */
  onAssetRemoved?: (assetId: string) => void;
  showCta?: boolean;
  showAltText?: boolean;
  disabled?: boolean;
  className?: string;
}) => {
  const emit = (patch: Partial<BannerImageValue>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className={className}>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label className="text-sm">Imagem desktop</Label>
          <MediaUploader
            value={value.desktop ? [value.desktop] : []}
            onChange={(items) =>
              emit({ desktop: items[0] ?? null })
            }
            onAssetRemoved={onAssetRemoved}
            multiple={false}
            disabled={disabled}
            emptyTitle="Imagem desktop"
            emptyDescription="Use uma imagem horizontal de alta resolução (recomendado 1920x720)."
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm">Imagem mobile</Label>
          <MediaUploader
            value={value.mobile ? [value.mobile] : []}
            onChange={(items) =>
              emit({ mobile: items[0] ?? null })
            }
            onAssetRemoved={onAssetRemoved}
            multiple={false}
            disabled={disabled}
            emptyTitle="Imagem mobile"
            emptyDescription="Use uma imagem vertical para celular (recomendado 750x1000)."
          />
        </div>
      </div>

      {(showAltText || showCta) && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {showAltText && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="banner-alt" className="text-sm">
                Texto alternativo
              </Label>
              <Input
                id="banner-alt"
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
              <Label htmlFor="banner-cta" className="text-sm">
                Link de destino
              </Label>
              <Input
                id="banner-cta"
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

