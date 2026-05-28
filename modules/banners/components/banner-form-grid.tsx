"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import { Controller, type Control } from "react-hook-form";

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
  bannerPlacementSchema,
  contentStatusSchema,
} from "@/modules/banners/validations";
import type { BannerImageValue } from "@/modules/media/types";

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
  const hasPendingImage =
    imageValue.desktop?.kind === "pending" ||
    imageValue.mobile?.kind === "pending";

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
                <FieldLabel>Imagens</FieldLabel>
                <BannerImageField
                  value={imageValue}
                  onChange={onImageValueChange}
                  onAssetRemoved={onAssetRemoved}
                  showCta={false}
                  showAltText={hasPendingImage}
                  disabled={isSubmitting}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

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

            <Controller
              name="displayOrder"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="displayOrder">Ordem</FieldLabel>
                  <Input
                    id="displayOrder"
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    name={field.name}
                    ref={field.ref}
                    value={Number.isFinite(field.value) ? field.value : ""}
                    onBlur={field.onBlur}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(
                        value === ""
                          ? Number.NaN
                          : Number.parseInt(value, 10),
                      );
                    }}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />
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
