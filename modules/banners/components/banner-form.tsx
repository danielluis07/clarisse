"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

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
  useBannerSuspense,
  useCreateBanner,
  useDeleteBanner,
  useUpdateBanner,
} from "@/modules/banners/hooks";
import type { BannerOutput } from "@/modules/banners/types";
import {
  bannerFormSchema,
  type BannerFormInput,
  type BannerFormOutput,
} from "@/modules/banners/form-schema";
import {
  bannerBackHref,
  bannerPlacementLabels,
  bannerStatusLabels,
  getBannerDeleteErrorMessage,
  getBannerFormDefaultValues,
  getBannerFormErrorMessage,
  getBannerImageValue,
  withBannerUploadAltText,
} from "@/modules/banners/form-utils";
import {
  bannerPlacementSchema,
  contentStatusSchema,
} from "@/modules/banners/validations";
import { useCommitMedia, useDeleteMedia } from "@/modules/media/hooks";
import type {
  BannerImageValue,
  MediaSelectionItem,
} from "@/modules/media/types";
import { useConfirm } from "@/providers/confirm-provider";

type ResolvedBannerImages = {
  imageId: string | null;
  mobileImageId: string | null;
  uploadedAssetIds: string[];
};

export const BannerForm = ({ id }: { id?: string }) => {
  if (id) return <UpdateBannerForm id={id} />;
  return <CreateBannerForm />;
};

const CreateBannerForm = () => {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateBanner();

  const handleSubmit = async (
    values: BannerFormOutput,
    images: {
      imageId: string | null;
      mobileImageId: string | null;
      uploadedAssetIds: string[];
    },
  ) => {
    await mutateAsync({
      ...values,
      imageId: images.imageId,
      mobileImageId: images.mobileImageId,
    });
    toast.success("Banner criado com sucesso.");
    router.push("/admin/banners");
    router.refresh();
  };

  return (
    <BannerFormBody
      mode="create"
      defaultValues={getBannerFormDefaultValues()}
      initialImages={getBannerImageValue()}
      mutationPending={isPending}
      onSubmit={handleSubmit}
    />
  );
};

const UpdateBannerForm = ({ id }: { id: string }) => {
  const router = useRouter();
  const { data: banner } = useBannerSuspense({ id });
  const { mutateAsync, isPending } = useUpdateBanner();
  const defaultValues = useMemo(
    () => getBannerFormDefaultValues(banner),
    [banner],
  );
  const initialImages = useMemo(() => getBannerImageValue(banner), [banner]);

  const handleSubmit = async (
    values: BannerFormOutput,
    images: ResolvedBannerImages,
  ) => {
    const updated = await mutateAsync({
      id,
      ...values,
      imageId: images.imageId,
      mobileImageId: images.mobileImageId,
    });
    toast.success("Banner atualizado com sucesso.");
    router.refresh();
    return updated;
  };

  return (
    <BannerFormBody
      mode="update"
      banner={banner}
      defaultValues={defaultValues}
      initialImages={initialImages}
      mutationPending={isPending}
      onSubmit={handleSubmit}
    />
  );
};

const BannerFormBody = ({
  mode,
  banner,
  defaultValues,
  initialImages,
  mutationPending,
  onSubmit,
}: {
  mode: "create" | "update";
  banner?: BannerOutput;
  defaultValues: BannerFormInput;
  initialImages: BannerImageValue;
  mutationPending: boolean;
  onSubmit: (
    values: BannerFormOutput,
    images: ResolvedBannerImages,
  ) => Promise<unknown>;
}) => {
  const router = useRouter();
  const deleteBanner = useDeleteBanner();
  const deleteMedia = useDeleteMedia();
  const { commit } = useCommitMedia();
  const { confirm, closeConfirm, setPending } = useConfirm();
  const [imageValue, setImageValue] = useState<BannerImageValue>(initialImages);
  const [orphanedAssetIds, setOrphanedAssetIds] = useState<string[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);
  const { control, handleSubmit, reset } = useForm<
    BannerFormInput,
    unknown,
    BannerFormOutput
  >({
    resolver: zodResolver(bannerFormSchema),
    defaultValues,
  });

  const isSubmitting =
    isCommitting || mutationPending || deleteBanner.isPending;
  const isSaving = isCommitting || mutationPending;
  const title = mode === "create" ? "Novo banner" : "Editar banner";
  const submitLabel = mode === "create" ? "Criar banner" : "Salvar alterações";
  const hasPendingImage =
    imageValue.desktop?.kind === "pending" ||
    imageValue.mobile?.kind === "pending";

  const resolveImages = async (): Promise<ResolvedBannerImages> => {
    const desktop = withBannerUploadAltText(
      imageValue.desktop,
      imageValue.altText,
    );
    const mobile = withBannerUploadAltText(
      imageValue.mobile,
      imageValue.altText,
    );
    const items = [desktop, mobile].filter(
      (item): item is MediaSelectionItem => !!item,
    );
    const pendingLocalIds = new Set(
      items
        .filter((item) => item.kind === "pending")
        .map((item) => item.localId),
    );
    const committed = await commit({ items, folder: "banners" });
    const committedByLocalId = new Map(
      committed.map((item) => [item.localId, item]),
    );

    return {
      imageId: desktop
        ? (committedByLocalId.get(desktop.localId)?.assetId ?? null)
        : null,
      mobileImageId: mobile
        ? (committedByLocalId.get(mobile.localId)?.assetId ?? null)
        : null,
      uploadedAssetIds: committed
        .filter((item) => pendingLocalIds.has(item.localId))
        .map((item) => item.assetId),
    };
  };

  const cleanupAssets = async (assetIds: string[]) => {
    if (!assetIds.length) return;

    await Promise.allSettled(
      assetIds.map((assetId) => deleteMedia.mutateAsync({ id: assetId })),
    );
  };

  const submit = handleSubmit(async (values) => {
    if (isSubmitting) return;

    setIsCommitting(true);
    let uploadedAssetIds: string[] = [];

    try {
      const images = await resolveImages();
      uploadedAssetIds = images.uploadedAssetIds;
      const result = await onSubmit(values, images);

      if (orphanedAssetIds.length) {
        await cleanupAssets(orphanedAssetIds);
        setOrphanedAssetIds([]);
      }

      if (mode === "update" && result) {
        const updated = result as BannerOutput;
        reset(getBannerFormDefaultValues(updated));
        setImageValue(getBannerImageValue(updated));
      }
    } catch (error) {
      await cleanupAssets(uploadedAssetIds);
      toast.error(getBannerFormErrorMessage(error));
    } finally {
      setIsCommitting(false);
    }
  });

  const handleAssetRemoved = (assetId: string) => {
    setOrphanedAssetIds((current) =>
      current.includes(assetId) ? current : [...current, assetId],
    );
  };

  const handleDelete = async () => {
    if (!banner) return;

    const confirmed = await confirm(
      "Excluir banner?",
      `O banner "${banner.title}" será removido permanentemente. Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    try {
      setPending(true);
      await deleteBanner.mutateAsync({ id: banner.id });
      toast.success("Banner excluído com sucesso.");
      router.push("/admin/banners");
      router.refresh();
    } catch (error) {
      toast.error(getBannerDeleteErrorMessage(error));
    } finally {
      closeConfirm();
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b pb-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-col gap-1.5">
          <Button asChild variant="ghost" size="sm" className="w-fit px-0">
            <Link href="/admin/banners">
              <ArrowLeft data-icon="inline-start" />
              Banners
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {mode === "create"
              ? "Monte um bloco editorial com imagem, chamada, destino e prioridade de exibição."
              : "Ajuste imagens, copy, posicionamento e publicação deste banner."}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {banner && (
            <Button
              type="button"
              variant="destructive"
              disabled={isSubmitting}
              onClick={handleDelete}>
              <Trash2 data-icon="inline-start" />
              Excluir
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="w-44">
            {isSaving ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            {isSaving ? "Salvando" : submitLabel}
          </Button>
        </div>
      </header>

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
                    onChange={setImageValue}
                    onAssetRemoved={handleAssetRemoved}
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
                        errors={
                          fieldState.error ? [fieldState.error] : undefined
                        }
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
                        errors={
                          fieldState.error ? [fieldState.error] : undefined
                        }
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
                        errors={
                          fieldState.error ? [fieldState.error] : undefined
                        }
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
                        errors={
                          fieldState.error ? [fieldState.error] : undefined
                        }
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
                        errors={
                          fieldState.error ? [fieldState.error] : undefined
                        }
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
    </form>
  );
};
