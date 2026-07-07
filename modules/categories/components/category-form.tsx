"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CategoryImageField } from "@/modules/media/components/category-image-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCategorySuspense,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/modules/categories/hooks";
import type { CategoryOutput } from "@/modules/categories/types";
import { createCategoryInput } from "@/modules/categories/validations";
import { useCommitMedia, useDeleteMedia } from "@/modules/media/hooks";
import type { MediaSelectionItem } from "@/modules/media/types";
import { fromExistingAsset } from "@/modules/media/types";
import { useConfirm } from "@/providers/confirm-provider";
import { useTRPC } from "@/trpc/client";

const categoryFormSchema = createCategoryInput.omit({ imageId: true });

type CategoryFormInput = z.input<typeof categoryFormSchema>;
type CategoryFormOutput = z.output<typeof categoryFormSchema>;

const getDefaultValues = (category?: CategoryOutput): CategoryFormInput => ({
  name: category?.name ?? "",
  description: category?.description ?? "",
  isActive: category?.isActive ?? true,
  displayOrder: category?.displayOrder ?? 0,
  seoTitle: category?.seoTitle ?? "",
  seoDescription: category?.seoDescription ?? "",
});

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Não foi possível salvar a categoria.";

const getDeleteErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Não foi possível excluir a categoria.";

export const CategoryForm = ({ id }: { id?: string }) => {
  if (id) return <UpdateCategoryForm id={id} />;
  return <CreateCategoryForm />;
};

const CreateCategoryForm = () => {
  const router = useRouter();
  const createCategory = useCreateCategory();

  const handleSubmit = async (
    values: CategoryFormOutput,
    imageId: string | null,
  ) => {
    await createCategory.mutateAsync({ ...values, imageId });
    toast.success("Categoria criada com sucesso.");
    router.push("/admin/categories");
    router.refresh();
  };

  return (
    <CategoryFormBody
      mode="create"
      defaultValues={getDefaultValues()}
      initialImageId={null}
      mutationPending={createCategory.isPending}
      onSubmit={handleSubmit}
    />
  );
};

const UpdateCategoryForm = ({ id }: { id: string }) => {
  const router = useRouter();
  const { data: category } = useCategorySuspense({ id });
  const updateCategory = useUpdateCategory();

  const handleSubmit = async (
    values: CategoryFormOutput,
    imageId: string | null,
  ) => {
    const updated = await updateCategory.mutateAsync({
      id,
      ...values,
      imageId,
    });
    toast.success("Categoria atualizada com sucesso.");
    router.refresh();
    return updated;
  };

  return (
    <CategoryFormBody
      mode="update"
      category={category}
      defaultValues={getDefaultValues(category)}
      initialImageId={category.imageId ?? null}
      mutationPending={updateCategory.isPending}
      onSubmit={handleSubmit}
    />
  );
};

const CategoryFormBody = ({
  mode,
  category,
  defaultValues,
  initialImageId,
  mutationPending,
  onSubmit,
}: {
  mode: "create" | "update";
  category?: CategoryOutput;
  defaultValues: CategoryFormInput;
  initialImageId: string | null;
  mutationPending: boolean;
  onSubmit: (
    values: CategoryFormOutput,
    imageId: string | null,
  ) => Promise<unknown>;
}) => {
  const {
    handleSubmit,
    reset,
    control,
  } = useForm<CategoryFormInput, unknown, CategoryFormOutput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });
  const router = useRouter();
  const { confirm, closeConfirm, setPending } = useConfirm();
  const deleteCategory = useDeleteCategory();
  const trpc = useTRPC();
  const { commit } = useCommitMedia();
  const deleteMedia = useDeleteMedia();

  // Hydrate the initial existing asset (edit mode) so the field can show it.
  const { data: initialAsset } = useQuery({
    ...trpc.media.getById.queryOptions({ id: initialImageId ?? "" }),
    enabled: !!initialImageId,
  });

  // Until the user interacts, the selection reflects the initial asset (once
  // it loads). After any change (replace, add, remove), `touched` flips and
  // `userSelection` becomes the source of truth.
  const [userSelection, setUserSelection] = useState<MediaSelectionItem | null>(
    null,
  );
  const [touched, setTouched] = useState(false);
  const [orphanedAssetIds, setOrphanedAssetIds] = useState<string[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);

  const selection: MediaSelectionItem | null = touched
    ? userSelection
    : initialAsset
      ? fromExistingAsset(initialAsset)
      : null;

  const isSubmitting = isCommitting || mutationPending;

  const submitLabel =
    mode === "create" ? "Criar categoria" : "Salvar alterações";
  const title = mode === "create" ? "Nova categoria" : "Editar categoria";
  const description =
    mode === "create"
      ? "Cadastre uma categoria para organizar a navegação da loja."
      : "Atualize os dados editoriais e de navegação desta categoria.";

  const submit = handleSubmit(async (values) => {
    if (isSubmitting) return;
    setIsCommitting(true);

    try {
      // 1. Upload any pending file → resolve to assetId
      const committed = selection
        ? await commit({ items: [selection], folder: "categories" })
        : [];
      const imageId = committed[0]?.assetId ?? null;

      // 2. Persist the category
      const result = await onSubmit(values, imageId);

      // 3. Clean up orphans (best-effort — log if any fail)
      if (orphanedAssetIds.length) {
        await Promise.allSettled(
          orphanedAssetIds.map((id) => deleteMedia.mutateAsync({ id })),
        );
        setOrphanedAssetIds([]);
      }

      // 4. Resync local state with what the server returned (update mode)
      if (mode === "update" && result) {
        const updated = result as CategoryOutput;
        reset(getDefaultValues(updated));
        if (committed[0]) {
          setUserSelection({
            kind: "existing",
            localId: committed[0].assetId,
            assetId: committed[0].assetId,
            url: committed[0].url,
            filename: committed[0].filename,
            altText: committed[0].altText,
          });
        } else {
          setUserSelection(null);
        }
        setTouched(true);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsCommitting(false);
    }
  });

  const handleSelectionChange = (next: MediaSelectionItem | null) => {
    setUserSelection(next);
    setTouched(true);
  };

  const handleAssetRemoved = (assetId: string) => {
    setOrphanedAssetIds((prev) =>
      prev.includes(assetId) ? prev : [...prev, assetId],
    );
  };

  const handleDelete = async () => {
    if (!category) return;

    const confirmed = await confirm(
      "Excluir categoria?",
      `A categoria "${category.name}" será removida permanentemente. Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    try {
      setPending(true);
      await deleteCategory.mutateAsync({ id: category.id });
      toast.success("Categoria excluída com sucesso.");
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      toast.error(getDeleteErrorMessage(error));
    } finally {
      closeConfirm();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <Button asChild variant="ghost" size="sm" className="w-fit px-0">
            <Link href="/admin/categories">
              <ArrowLeft data-icon="inline-start" />
              Categorias
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        {category && (
          <div className="rounded-lg border bg-card px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              /{category.slug}
            </span>
          </div>
        )}
      </header>

      <form onSubmit={submit} noValidate>
        <Card className="max-w-4xl">
          <CardHeader className="border-b">
            <CardTitle className="font-admin">Dados da categoria</CardTitle>
            <CardDescription>
              Configure como esta categoria aparece no painel e na vitrine.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <div className="grid gap-5 md:grid-cols-[1fr_160px]">
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name">Nome</FieldLabel>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Blazers"
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
                  name="displayOrder"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="displayOrder">Ordem</FieldLabel>
                      <Input
                        id="displayOrder"
                        type="number"
                        min={0}
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
                        errors={
                          fieldState.error ? [fieldState.error] : undefined
                        }
                      />
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="description">Descrição</FieldLabel>
                    <Textarea
                      id="description"
                      placeholder="Peças de alfaiataria para composições elegantes."
                      rows={4}
                      name={field.name}
                      ref={field.ref}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
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
                name="isActive"
                control={control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}>
                    <Checkbox
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      disabled={isSubmitting}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="isActive">Ativa na loja</FieldLabel>
                      <FieldDescription>
                        Categorias inativas ficam ocultas na navegação pública.
                      </FieldDescription>
                      <FieldError
                        errors={
                          fieldState.error ? [fieldState.error] : undefined
                        }
                      />
                    </FieldContent>
                  </Field>
                )}
              />

              <Field>
                <FieldLabel>Imagem da categoria</FieldLabel>
                <FieldDescription>
                  Imagem usada nas vitrines e na navegação editorial. O upload
                  acontece ao salvar.
                </FieldDescription>
                <CategoryImageField
                  value={selection}
                  onChange={handleSelectionChange}
                  onAssetRemoved={handleAssetRemoved}
                  disabled={isSubmitting}
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Controller
                  name="seoTitle"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="seoTitle">Título SEO</FieldLabel>
                      <Input
                        id="seoTitle"
                        type="text"
                        placeholder="Blazers femininos | Clarisse"
                        name={field.name}
                        ref={field.ref}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                        disabled={isSubmitting}
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
                  name="seoDescription"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="seoDescription">
                        Descrição SEO
                      </FieldLabel>
                      <Textarea
                        id="seoDescription"
                        placeholder="Descubra blazers femininos sofisticados para rotina e ocasiões especiais."
                        rows={3}
                        name={field.name}
                        ref={field.ref}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                        disabled={isSubmitting}
                      />
                      <FieldError
                        errors={
                          fieldState.error ? [fieldState.error] : undefined
                        }
                      />
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            {category ? (
              <Button
                type="button"
                variant="destructive"
                disabled={isSubmitting || deleteCategory.isPending}
                onClick={handleDelete}
                className="sm:mr-auto">
                <Trash2 data-icon="inline-start" />
                Excluir categoria
              </Button>
            ) : (
              <span aria-hidden className="hidden sm:block" />
            )}

            <div className="flex justify-end gap-2">
              <Button asChild variant="outline" disabled={isSubmitting}>
                <Link href="/admin/categories">Cancelar</Link>
              </Button>
              <Button type="submit" className="w-40" isLoading={isSubmitting}>
                {!isSubmitting && <Save data-icon="inline-start" />}
                {submitLabel}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
