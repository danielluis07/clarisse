"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import { Controller, type Control, useWatch } from "react-hook-form";

import { BannerImageField } from "@/components/media/banner-image-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  bannerPlacementLabels,
  bannerStatusLabels,
} from "@/modules/banners/constants";
import {
  type BannerFormInput,
  type BannerFormOutput,
} from "@/modules/banners/form-schema";
import { bannerBackHref } from "@/modules/banners/form-utils";
import {
  focalToPosition,
  HERO_DESKTOP_ASPECT_CLASS,
  HERO_MOBILE_ASPECT_CLASS,
} from "@/modules/banners/hero-layout";
import {
  bannerPlacementSchema,
  contentStatusSchema,
} from "@/modules/banners/validations";
import type {
  BannerImageValue,
  FocalPoint,
  MediaSelectionItem,
} from "@/modules/media/types";

export const BannerFormGrid = ({
  control,
  imageValue,
  onImageValueChange,
  onAssetRemoved,
  isSubmitting,
  isSaving,
  submitLabel,
}: {
  control: Control<BannerFormInput, unknown, BannerFormOutput>;
  imageValue: BannerImageValue;
  onImageValueChange: (value: BannerImageValue) => void;
  onAssetRemoved: (assetId: string) => void;
  isSubmitting: boolean;
  isSaving: boolean;
  submitLabel: string;
}) => {
  const previewValues = useWatch({ control });
  const hasPendingImage =
    imageValue.desktop?.kind === "pending" ||
    imageValue.mobile?.kind === "pending";
  const showHeroPreview = previewValues.placement === "home_hero";

  return (
    <div className="grid max-w-6xl gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="font-admin">Imagem do banner</CardTitle>
            <CardDescription>
              Defina as versões desktop e mobile usadas na vitrine.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <BannerImageField
                  value={imageValue}
                  onChange={onImageValueChange}
                  onAssetRemoved={onAssetRemoved}
                  showCta={false}
                  showAltText={hasPendingImage}
                  showFocalPicker={showHeroPreview}
                  disabled={isSubmitting}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {showHeroPreview && (
          <HeroBannerPreview values={previewValues} imageValue={imageValue} />
        )}

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="font-admin">Conteúdo editorial</CardTitle>
            <CardDescription>
              Texto exibido sobre ou próximo ao banner na loja.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="title"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="title">Título</FieldLabel>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Alfaiataria para todos os dias"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                      {...field}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </Field>
                )}
              />

              <Controller
                name="subtitle"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="subtitle">Subtítulo</FieldLabel>
                    <Input
                      id="subtitle"
                      type="text"
                      placeholder="Soft tailoring"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                      {...field}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </Field>
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="description">Descrição</FieldLabel>
                    <Textarea
                      id="description"
                      className="resize-none"
                      placeholder="Peças precisas, fluidas e prontas para acompanhar a rotina."
                      rows={5}
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                      {...field}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="font-admin">Chamada para ação</CardTitle>
            <CardDescription>
              Configure o botão ou link associado ao banner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-5 md:grid-cols-2">
              <Controller
                name="ctaLabel"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ctaLabel">Texto do CTA</FieldLabel>
                    <Input
                      id="ctaLabel"
                      type="text"
                      placeholder="Ver coleção"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                      {...field}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </Field>
                )}
              />

              <Controller
                name="ctaUrl"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ctaUrl">URL do CTA</FieldLabel>
                    <Input
                      id="ctaUrl"
                      type="text"
                      placeholder="/colecoes/soft-tailoring"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                      {...field}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : undefined}
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader className="border-b">
          <CardTitle className="font-admin">Publicação</CardTitle>
          <CardDescription>
            Defina onde o banner aparece e sua prioridade comercial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              name="placement"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="placement">Posição</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}>
                    <SelectTrigger
                      id="placement"
                      className="w-full"
                      aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Selecione uma posição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {bannerPlacementSchema.options.map((placement) => (
                          <SelectItem key={placement} value={placement}>
                            {bannerPlacementLabels[placement]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : undefined}
                  />
                </Field>
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="status">Status</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}>
                    <SelectTrigger
                      id="status"
                      className="w-full"
                      aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {contentStatusSchema.options.map((status) => (
                          <SelectItem key={status} value={status}>
                            {bannerStatusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Apenas banners ativos aparecem na vitrine pública.
                  </FieldDescription>
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : undefined}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSaving ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            {isSaving ? "Salvando" : submitLabel}
          </Button>
          <Button asChild variant="outline" disabled={isSubmitting}>
            <Link href={bannerBackHref}>Cancelar</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

type HeroPreviewValues = Partial<
  Pick<
    BannerFormInput,
    "title" | "subtitle" | "description" | "ctaLabel" | "ctaUrl"
  >
>;

const HeroBannerPreview = ({
  values,
  imageValue,
}: {
  values: HeroPreviewValues;
  imageValue: BannerImageValue;
}) => {
  const title = getPreviewText(values.title, "Título do hero");
  const subtitle = getPreviewText(values.subtitle, "Subtítulo editorial");
  const description = getPreviewText(
    values.description,
    "Descrição curta exibida sobre a imagem do hero.",
  );
  const ctaLabel = getPreviewText(values.ctaLabel, "CTA principal");
  const desktopUrl = getSelectionPreviewUrl(imageValue.desktop);
  const mobileUrl = getSelectionPreviewUrl(imageValue.mobile) ?? desktopUrl;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="font-admin">Prévia do hero</CardTitle>
        <CardDescription>
          Visualização aproximada do corte desktop e mobile da home.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px]">
          <HeroPreviewFrame
            label="Desktop"
            imageUrl={desktopUrl}
            focal={imageValue.desktopFocal}
            title={title}
            subtitle={subtitle}
            description={description}
            ctaLabel={ctaLabel}
            variant="desktop"
          />
          <HeroPreviewFrame
            label="Mobile"
            imageUrl={mobileUrl}
            focal={imageValue.mobileFocal}
            title={title}
            subtitle={subtitle}
            description={description}
            ctaLabel={ctaLabel}
            variant="mobile"
          />
        </div>
      </CardContent>
    </Card>
  );
};

const HeroPreviewFrame = ({
  label,
  imageUrl,
  focal,
  title,
  subtitle,
  description,
  ctaLabel,
  variant,
}: {
  label: string;
  imageUrl: string | null;
  focal: FocalPoint;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  variant: "desktop" | "mobile";
}) => (
  <div className="flex flex-col gap-2">
    <div className="text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
      {label}
    </div>
    <div
      className={
        variant === "desktop"
          ? `relative ${HERO_DESKTOP_ASPECT_CLASS} overflow-hidden rounded-md border bg-neutral-950`
          : `relative ${HERO_MOBILE_ASPECT_CLASS} overflow-hidden rounded-md border bg-neutral-950`
      }>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover"
        style={
          imageUrl
            ? {
                backgroundImage: `url("${imageUrl}")`,
                backgroundPosition: focalToPosition(focal),
              }
            : undefined
        }
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/5"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-black/40 to-transparent"
      />
      <div
        className={
          variant === "desktop"
            ? "absolute inset-x-0 bottom-0 p-5 text-white"
            : "absolute inset-x-0 bottom-0 p-4 text-white"
        }>
        <p className="text-[8px] uppercase tracking-[0.28em] text-white/75">
          {subtitle}
        </p>
        <h3
          className={
            variant === "desktop"
              ? "mt-2 font-heading text-3xl font-light leading-none tracking-tight"
              : "mt-2 font-heading text-2xl font-light leading-none tracking-tight"
          }>
          {title}
        </h3>
        <p
          className={
            variant === "desktop"
              ? "mt-3 max-w-sm text-xs leading-relaxed text-white/75"
              : "mt-3 text-[11px] leading-relaxed text-white/75"
          }>
          {description}
        </p>
        <div
          className={
            variant === "desktop"
              ? "mt-4 inline-flex bg-white px-4 py-2 text-[8px] font-medium uppercase tracking-[0.2em] text-black"
              : "mt-4 inline-flex bg-white px-3 py-2 text-[7px] font-medium uppercase tracking-[0.18em] text-black"
          }>
          {ctaLabel}
        </div>
      </div>
    </div>
  </div>
);

const getSelectionPreviewUrl = (item: MediaSelectionItem | null) => {
  if (!item) return null;
  return item.kind === "existing" ? item.url : item.previewUrl;
};

const getPreviewText = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};
