"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import type { ProductImageSlot } from "@/components/media/product-images-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { compressImageToWebP } from "@/lib/utils";
import { analyzeProductImagesAction } from "@/modules/products/ai-actions";
import {
  productFormSchema,
  type ProductFormInput,
  type ProductFormOutput,
  type VariantFormInput,
} from "@/modules/products/form-schema";
import {
  buildProductPayload,
  defaultVariant,
  getProductFormDefaultValues,
  getProductFormErrorMessage,
  getVariantColorOptions,
  normalizeSkuPart,
  parseColorToken,
  productImagesToSlots,
  splitTokens,
} from "@/modules/products/form-utils";
import {
  useCreateProduct,
  useDeleteProduct,
  useProductFormOptionsSuspense,
  useUpdateProduct,
} from "@/modules/products/hooks";
import type { ProductOutput } from "@/modules/products/types";
import { useCommitMedia, useDeleteMedia } from "@/modules/media/hooks";
import { useConfirm } from "@/providers/confirm-provider";
import { ProductFormVariantRow } from "./product-form-variant-row";
import { ProductFormGrid } from "./product-form-grid";

const MAX_ANALYSIS_IMAGES = 8;

type ProductImageAnalysisSuggestion = Awaited<
  ReturnType<typeof analyzeProductImagesAction>
>;

const getImageSelectionKey = (slot: ProductImageSlot) =>
  slot.selection.kind === "existing"
    ? `existing:${slot.selection.assetId}`
    : [
        "pending",
        slot.selection.localId,
        slot.selection.file.name,
        slot.selection.file.size,
        slot.selection.file.lastModified,
      ].join(":");

export const ProductFormBody = ({
  mode,
  product,
}: {
  mode: "create" | "update";
  product?: ProductOutput;
}) => {
  const router = useRouter();
  const { data: options } = useProductFormOptionsSuspense();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const deleteMedia = useDeleteMedia();
  const { commit } = useCommitMedia();
  const { confirm, closeConfirm, setPending } = useConfirm();
  const defaultValues = useMemo(
    () => getProductFormDefaultValues(product),
    [product],
  );
  const [imageSlots, setImageSlots] = useState<ProductImageSlot[]>(() =>
    productImagesToSlots(product),
  );
  const [orphanedAssetIds, setOrphanedAssetIds] = useState<string[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedImageSignature, setAnalyzedImageSignature] = useState<
    string | null
  >(null);
  const [colorDraft, setColorDraft] = useState("Preto #111111, Off White");
  const [sizeDraft, setSizeDraft] = useState("PP, P, M, G");
  const [skuPrefix, setSkuPrefix] = useState("");

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "variants",
    keyName: "fieldId",
  });
  const watchedVariants = useWatch({
    control,
    name: "variants",
  });
  const imageColorOptions = useMemo(
    () => getVariantColorOptions(watchedVariants),
    [watchedVariants],
  );
  const imageSelectionSignature = useMemo(
    () => imageSlots.map(getImageSelectionKey).sort().join("|"),
    [imageSlots],
  );
  const hasAnalyzedCurrentImages =
    imageSelectionSignature !== "" &&
    analyzedImageSignature === imageSelectionSignature;

  const isSaving =
    isCommitting ||
    createProduct.isPending ||
    updateProduct.isPending ||
    deleteProduct.isPending;
  const isSubmitting = isSaving || isAnalyzing;

  const title = mode === "create" ? "Novo produto" : "Editar produto";
  const submitLabel = mode === "create" ? "Criar produto" : "Salvar produto";
  const backHref = "/admin/products";

  const resolveImages = async () => {
    const committed = await commit({
      items: imageSlots.map((slot) => slot.selection),
      folder: "products",
    });
    const committedByLocalId = new Map(
      committed.map((item) => [item.localId, item]),
    );

    const images = imageSlots.map((slot, index) => {
      const committedItem = committedByLocalId.get(slot.selection.localId);
      const mediaAssetId = committedItem?.assetId ?? slot.draft.assetId;

      if (!mediaAssetId) {
        throw new Error("Uma imagem do produto não foi enviada.");
      }

      return {
        mediaAssetId,
        colorName: slot.draft.colorName,
        colorHex: slot.draft.colorHex,
        altText: slot.draft.altText,
        position: index,
        isPrimary: slot.draft.isPrimary,
      };
    });

    return { images, committedByLocalId };
  };

  const refreshCommittedSlots = (
    committedByLocalId: Map<
      string,
      {
        assetId: string;
        url: string;
        filename: string;
        altText: string | null;
      }
    >,
  ) => {
    setImageSlots((current) =>
      current.map((slot) => {
        const committed = committedByLocalId.get(slot.selection.localId);
        if (!committed) return slot;

        return {
          selection: {
            kind: "existing",
            localId: committed.assetId,
            assetId: committed.assetId,
            url: committed.url,
            filename: committed.filename,
            altText: slot.draft.altText ?? committed.altText,
          },
          draft: {
            ...slot.draft,
            localId: committed.assetId,
            assetId: committed.assetId,
            altText: slot.draft.altText ?? committed.altText,
          },
        };
      }),
    );
  };

  const submit = handleSubmit(async (values) => {
    if (isSubmitting) return;

    // Prevent creating a product without a category in the client UI
    if (mode === "create" && !values.categoryId) {
      toast.error("Categoria é obrigatória.");
      return;
    }

    setIsCommitting(true);

    try {
      const { images, committedByLocalId } = await resolveImages();
      const payload = buildProductPayload(values, images);

      if (mode === "create") {
        const { variants, ...productPayload } = payload;
        await createProduct.mutateAsync({
          ...productPayload,
          variants: variants.map((variant) => ({
            sku: variant.sku,
            colorName: variant.colorName,
            colorHex: variant.colorHex,
            size: variant.size,
            priceCents: variant.priceCents,
            compareAtPriceCents: variant.compareAtPriceCents,
            stockQuantity: variant.stockQuantity,
            lowStockThreshold: variant.lowStockThreshold,
            weightGrams: variant.weightGrams,
            isActive: variant.isActive,
            displayOrder: variant.displayOrder,
          })),
        });
        toast.success("Produto criado com sucesso.");
        router.push(`/admin/products`);
        router.refresh();
        return;
      }

      if (!product) return;

      await updateProduct.mutateAsync({
        id: product.id,
        ...payload,
      });

      if (orphanedAssetIds.length) {
        await Promise.allSettled(
          orphanedAssetIds.map((assetId) =>
            deleteMedia.mutateAsync({ id: assetId }),
          ),
        );
        setOrphanedAssetIds([]);
      }

      refreshCommittedSlots(committedByLocalId);
      toast.success("Produto atualizado com sucesso.");
      router.refresh();
    } catch (error) {
      toast.error(getProductFormErrorMessage(error));
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
    if (!product) return;

    const confirmed = await confirm(
      "Excluir produto?",
      `O produto "${product.name}" será removido permanentemente. Para produtos com pedidos vinculados, arquive em vez de excluir.`,
    );

    if (!confirmed) return;

    try {
      setPending(true);
      await deleteProduct.mutateAsync({ id: product.id });
      toast.success("Produto excluído com sucesso.");
      router.push(backHref);
      router.refresh();
    } catch (error) {
      toast.error(getProductFormErrorMessage(error));
    } finally {
      closeConfirm();
    }
  };

  const buildAnalysisFormData = async () => {
    const slots = imageSlots.slice(0, MAX_ANALYSIS_IMAGES);
    const formData = new FormData();
    const descriptors: Array<{
      kind: "file" | "url";
      imageIndex: number;
      filename: string | null;
      altText: string | null;
      url?: string;
    }> = [];

    for (const [imageIndex, slot] of slots.entries()) {
      const altText = slot.draft.altText ?? slot.selection.altText ?? null;

      if (slot.selection.kind === "existing") {
        descriptors.push({
          kind: "url",
          imageIndex,
          url: slot.selection.url,
          filename: slot.selection.filename,
          altText,
        });
        continue;
      }

      const compressed = await compressImageToWebP(slot.selection.file);
      descriptors.push({
        kind: "file",
        imageIndex,
        filename: compressed.name,
        altText,
      });
      formData.append(`image-${imageIndex}`, compressed, compressed.name);
    }

    formData.append("images", JSON.stringify(descriptors));
    return formData;
  };

  const applyAnalysisSuggestion = (
    suggestion: ProductImageAnalysisSuggestion,
  ) => {
    setValue("name", suggestion.name, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("subtitle", suggestion.subtitle, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("description", suggestion.description, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("categoryId", suggestion.categoryId, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("collectionIds", suggestion.collectionIds, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("isFeatured", suggestion.isFeatured, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("material", suggestion.material, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("fit", suggestion.fit, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("careInstructions", suggestion.careInstructions, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("seoTitle", suggestion.seoTitle, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("seoDescription", suggestion.seoDescription, {
      shouldDirty: true,
      shouldTouch: true,
    });

    const currentVariants = getValues("variants");
    const pricesByOption = new Map(
      currentVariants.map((variant) => [
        `${variant.colorName.trim().toLowerCase()}::${variant.size.trim().toLowerCase()}`,
        {
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
        },
      ]),
    );
    const singleVariantPrices =
      currentVariants.length === 1
        ? {
            price: currentVariants[0]?.price ?? "",
            compareAtPrice: currentVariants[0]?.compareAtPrice ?? "",
          }
        : null;

    replace(
      suggestion.variants.map((variant) => {
        const optionKey = `${variant.colorName.trim().toLowerCase()}::${variant.size.trim().toLowerCase()}`;
        const prices =
          pricesByOption.get(optionKey) ??
          (suggestion.variants.length === 1 ? singleVariantPrices : null);

        return {
          ...defaultVariant(),
          sku: variant.sku,
          colorName: variant.colorName,
          colorHex: variant.colorHex ?? "",
          size: variant.size,
          price: prices?.price ?? "",
          compareAtPrice: prices?.compareAtPrice ?? "",
          stockQuantity: String(variant.stockQuantity),
          lowStockThreshold: String(variant.lowStockThreshold),
          weightGrams:
            variant.weightGrams == null ? "" : String(variant.weightGrams),
          isActive: variant.isActive,
        };
      }),
    );

    const imageSuggestionsByIndex = new Map(
      suggestion.imageSuggestions.map((imageSuggestion) => [
        imageSuggestion.imageIndex,
        imageSuggestion,
      ]),
    );
    const primaryImageIndex =
      suggestion.imageSuggestions.find(
        (imageSuggestion) => imageSuggestion.isPrimary,
      )?.imageIndex ?? 0;

    setImageSlots((current) =>
      current.map((slot, imageIndex) => {
        const imageSuggestion = imageSuggestionsByIndex.get(imageIndex);
        if (!imageSuggestion) {
          return {
            selection: slot.selection,
            draft: {
              ...slot.draft,
              isPrimary: imageIndex === primaryImageIndex,
            },
          };
        }

        const altText = imageSuggestion.altText || slot.draft.altText;

        return {
          selection: {
            ...slot.selection,
            altText,
          },
          draft: {
            ...slot.draft,
            colorName: imageSuggestion.colorName,
            colorHex: imageSuggestion.colorHex,
            altText,
            isPrimary: imageIndex === primaryImageIndex,
          },
        };
      }),
    );
  };

  const handleAnalyzeImages = async () => {
    if (mode !== "create" || isSubmitting) return;

    if (!imageSlots.length) {
      toast.error("Adicione ao menos uma imagem para analisar.");
      return;
    }

    if (imageSlots.length > MAX_ANALYSIS_IMAGES) {
      toast(`Analisando as ${MAX_ANALYSIS_IMAGES} primeiras imagens.`);
    }

    setIsAnalyzing(true);
    setAnalyzedImageSignature(imageSelectionSignature);

    try {
      const formData = await buildAnalysisFormData();
      const suggestion = await analyzeProductImagesAction(formData);
      applyAnalysisSuggestion(suggestion);
      toast.success("Sugestões aplicadas ao produto.");
    } catch (error) {
      toast.error(getProductFormErrorMessage(error));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateVariants = () => {
    const colors = splitTokens(colorDraft).map(parseColorToken);
    const sizes = splitTokens(sizeDraft);

    if (!colors.length || !sizes.length) {
      toast.error("Informe pelo menos uma cor e um tamanho.");
      return;
    }

    const baseSku =
      normalizeSkuPart(skuPrefix) ||
      normalizeSkuPart(getValues("name")) ||
      "SKU";
    const existingByOption = new Set(
      getValues("variants").map(
        (variant) =>
          `${variant.colorName.trim().toLowerCase()}::${variant.size.trim().toLowerCase()}`,
      ),
    );
    const generated: VariantFormInput[] = [];

    colors.forEach((color) => {
      sizes.forEach((size) => {
        const optionKey = `${color.colorName.toLowerCase()}::${size.toLowerCase()}`;
        if (existingByOption.has(optionKey)) return;

        generated.push({
          ...defaultVariant(),
          sku: `${baseSku}-${normalizeSkuPart(color.colorName) || "COR"}-${normalizeSkuPart(size) || "TAM"}`,
          colorName: color.colorName,
          colorHex: color.colorHex,
          size,
        });
      });
    });

    if (!generated.length) {
      toast("As combinações informadas já existem.");
      return;
    }

    const current = getValues("variants");
    const hasOnlyBlankDefault =
      current.length === 1 &&
      !current[0]?.sku &&
      current[0]?.colorName === "Default" &&
      current[0]?.size === "One Size";

    replace(hasOnlyBlankDefault ? generated : [...current, ...generated]);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <header className="sticky top-0 z-30 flex flex-col gap-4 border-b bg-background/95 pb-5 pt-4 backdrop-blur supports-backdrop-filter:bg-background/80 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-col gap-1.5">
          <Button asChild variant="ghost" size="sm" className="w-fit px-0">
            <Link href={backHref}>
              <ArrowLeft data-icon="inline-start" />
              Produtos
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {mode === "create"
              ? "Cadastre uma peça com imagens, variações, estoque e dados editoriais."
              : "Atualize merchandising, variações e estoque desta peça."}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {product && (
            <Button
              type="button"
              variant="destructive"
              disabled={isSubmitting}
              onClick={handleDelete}>
              <Trash2 data-icon="inline-start" />
              Excluir
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href={backHref}>Cancelar</Link>
          </Button>
          {mode === "create" && (
            <Button
              type="button"
              variant="secondary"
              disabled={
                isSubmitting || !imageSlots.length || hasAnalyzedCurrentImages
              }
              onClick={handleAnalyzeImages}
              className="w-44">
              {isAnalyzing ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Sparkles data-icon="inline-start" />
              )}
              {isAnalyzing ? "Analisando" : "Analisar imagens"}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="w-40">
            {isSaving ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            {isSaving ? "Salvando" : submitLabel}
          </Button>
        </div>
      </header>

      <ProductFormGrid
        control={control}
        errors={errors}
        isSubmitting={isSubmitting}
        imageSlots={imageSlots}
        onImageSlotsChange={setImageSlots}
        onAssetRemoved={handleAssetRemoved}
        imageColorOptions={imageColorOptions}
        options={options}
        variantsSlot={
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="font-admin">Variações e estoque</CardTitle>
              <CardDescription>
                Cada linha representa uma unidade comprável no carrinho.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <FieldSet>
                <FieldLegend variant="label">Gerador de variações</FieldLegend>
                <FieldDescription>
                  Crie combinações iniciais de cores e tamanhos para a grade.
                </FieldDescription>
                <FieldGroup className="grid gap-4 lg:grid-cols-[1fr_1fr_180px]">
                  <Field>
                    <FieldLabel htmlFor="variant-colors">Cores</FieldLabel>
                    <Textarea
                      id="variant-colors"
                      rows={3}
                      value={colorDraft}
                      onChange={(event) => setColorDraft(event.target.value)}
                      disabled={isSubmitting}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="variant-sizes">Tamanhos</FieldLabel>
                    <Textarea
                      id="variant-sizes"
                      rows={3}
                      value={sizeDraft}
                      onChange={(event) => setSizeDraft(event.target.value)}
                      disabled={isSubmitting}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="variant-sku-prefix">
                      Prefixo SKU
                    </FieldLabel>
                    <Input
                      id="variant-sku-prefix"
                      value={skuPrefix}
                      onChange={(event) => setSkuPrefix(event.target.value)}
                      placeholder="CLA-AURORA"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isSubmitting}
                      onClick={handleGenerateVariants}
                      className="mt-2 w-full">
                      <Sparkles data-icon="inline-start" />
                      Gerar
                    </Button>
                  </Field>
                </FieldGroup>
              </FieldSet>

              <Field data-invalid={!!errors.variants}>
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel>Grade de variantes</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => append(defaultVariant())}>
                    <Plus data-icon="inline-start" />
                    Variante
                  </Button>
                </div>
                <ScrollArea className="w-full rounded-lg border">
                  <div className="min-w-295">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-36">SKU</TableHead>
                          <TableHead className="min-w-36">Cor</TableHead>
                          <TableHead className="min-w-28">Hex</TableHead>
                          <TableHead className="min-w-24">Tamanho</TableHead>
                          <TableHead className="min-w-32">Preço</TableHead>
                          <TableHead className="min-w-32">Comparação</TableHead>
                          <TableHead className="min-w-24">Estoque</TableHead>
                          <TableHead className="min-w-24">Baixo</TableHead>
                          <TableHead className="min-w-24">Peso g</TableHead>
                          <TableHead className="min-w-28">Ativa</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field, index) => (
                          <ProductFormVariantRow
                            key={field.fieldId}
                            index={index}
                            canRemove={fields.length > 1}
                            disabled={isSubmitting}
                            errors={errors}
                            control={control}
                            onRemove={() => remove(index)}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <FieldError
                  errors={
                    errors.variants?.message
                      ? [{ message: errors.variants.message }]
                      : undefined
                  }
                />
              </Field>
            </CardContent>
          </Card>
        }
      />
    </form>
  );
};
