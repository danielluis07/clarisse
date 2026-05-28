"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BannerFormGrid } from "@/modules/banners/components/banner-form-grid";
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
  getBannerDeleteErrorMessage,
  getBannerFormDefaultValues,
  getBannerFormErrorMessage,
  getBannerImageValue,
  withBannerUploadAltText,
} from "@/modules/banners/form-utils";
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
  ): Promise<BannerOutput | null> => {
    let createdBanner: BannerOutput | null = null;

    try {
      createdBanner = await mutateAsync({
        ...values,
        imageId: images.imageId,
        mobileImageId: images.mobileImageId,
      });
      toast.success("Banner criado com sucesso.");
      return createdBanner;
    } catch (error) {
      toast.error(getBannerFormErrorMessage(error));
      return null;
    } finally {
      if (createdBanner) {
        router.push("/admin/banners");
        router.refresh();
      }
    }
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
  ): Promise<BannerOutput | null> => {
    let updatedBanner: BannerOutput | null = null;

    try {
      updatedBanner = await mutateAsync({
        id,
        ...values,
        imageId: images.imageId,
        mobileImageId: images.mobileImageId,
      });
      toast.success("Banner atualizado com sucesso.");
      return updatedBanner;
    } catch (error) {
      toast.error(getBannerFormErrorMessage(error));
      return null;
    } finally {
      if (updatedBanner) {
        router.refresh();
      }
    }
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
  ) => Promise<BannerOutput | null>;
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

      if (!result) {
        await cleanupAssets(uploadedAssetIds);
        return;
      }

      const selectedAssetIds = new Set(
        [imageValue.desktop, imageValue.mobile]
          .filter(
            (item): item is MediaSelectionItem & { kind: "existing" } =>
              item?.kind === "existing",
          )
          .map((item) => item.assetId),
      );
      const trulyOrphaned = orphanedAssetIds.filter(
        (id) => !selectedAssetIds.has(id),
      );
      if (trulyOrphaned.length) {
        await cleanupAssets(trulyOrphaned);
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

      <BannerFormGrid
        control={control}
        imageValue={imageValue}
        onImageValueChange={setImageValue}
        onAssetRemoved={handleAssetRemoved}
        isSubmitting={isSubmitting}
        isSaving={isSaving}
        submitLabel={submitLabel}
      />
    </form>
  );
};
