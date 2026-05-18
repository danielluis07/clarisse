"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
  useUpdateCategory,
} from "@/modules/categories/hooks";
import type { CategoryOutput } from "@/modules/categories/types";
import { createCategoryInput } from "@/modules/categories/validations";

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

const getErrorMessage = (error: unknown) => {
  return error instanceof Error
    ? error.message
    : "Não foi possível salvar a categoria.";
};

export const CategoryForm = ({ id }: { id?: string }) => {
  if (id) {
    return <UpdateCategoryForm id={id} />;
  }

  return <CreateCategoryForm />;
};

const CreateCategoryForm = () => {
  const router = useRouter();
  const createCategory = useCreateCategory();

  const handleSubmit = async (values: CategoryFormOutput) => {
    try {
      // Category image upload will be wired later through imageId once media
      // selection/upload is implemented.
      const category = await createCategory.mutateAsync(values);

      toast.success("Categoria criada com sucesso.");
      router.push(`/admin/categories`);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <CategoryFormBody
      mode="create"
      defaultValues={getDefaultValues()}
      isSubmitting={createCategory.isPending}
      onSubmit={handleSubmit}
    />
  );
};

const UpdateCategoryForm = ({ id }: { id: string }) => {
  const router = useRouter();
  const { data: category } = useCategorySuspense({ id });
  const updateCategory = useUpdateCategory();

  const handleSubmit = async (values: CategoryFormOutput) => {
    try {
      // Category image upload will be wired later through imageId once media
      // selection/upload is implemented.
      const updatedCategory = await updateCategory.mutateAsync({
        id,
        ...values,
      });

      toast.success("Categoria atualizada com sucesso.");
      router.refresh();

      return updatedCategory;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  return (
    <CategoryFormBody
      mode="update"
      category={category}
      defaultValues={getDefaultValues(category)}
      isSubmitting={updateCategory.isPending}
      onSubmit={handleSubmit}
    />
  );
};

const CategoryFormBody = ({
  mode,
  category,
  defaultValues,
  isSubmitting,
  onSubmit,
}: {
  mode: "create" | "update";
  category?: CategoryOutput;
  defaultValues: CategoryFormInput;
  isSubmitting: boolean;
  onSubmit: (values: CategoryFormOutput) => Promise<unknown>;
}) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormInput, unknown, CategoryFormOutput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  const submitLabel =
    mode === "create" ? "Criar categoria" : "Salvar alterações";

  const title = mode === "create" ? "Nova categoria" : "Editar categoria";
  const description =
    mode === "create"
      ? "Cadastre uma categoria para organizar a navegação da loja."
      : "Atualize os dados editoriais e de navegação desta categoria.";

  const submit = handleSubmit(async (values) => {
    const result = await onSubmit(values);

    if (mode === "update" && result) {
      reset(getDefaultValues(result as CategoryOutput));
    }
  });

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
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">Nome</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Blazers"
                    autoComplete="off"
                    aria-invalid={!!errors.name}
                    disabled={isSubmitting}
                    {...register("name")}
                  />
                  <FieldError
                    errors={errors.name ? [errors.name] : undefined}
                  />
                </Field>

                <Field data-invalid={!!errors.displayOrder}>
                  <FieldLabel htmlFor="displayOrder">Ordem</FieldLabel>
                  <Input
                    id="displayOrder"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    aria-invalid={!!errors.displayOrder}
                    disabled={isSubmitting}
                    {...register("displayOrder", { valueAsNumber: true })}
                  />
                  <FieldError
                    errors={
                      errors.displayOrder ? [errors.displayOrder] : undefined
                    }
                  />
                </Field>
              </div>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="description">Descrição</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Peças de alfaiataria para composições elegantes."
                  rows={4}
                  aria-invalid={!!errors.description}
                  disabled={isSubmitting}
                  {...register("description")}
                />
                <FieldError
                  errors={errors.description ? [errors.description] : undefined}
                />
              </Field>

              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Field
                    orientation="horizontal"
                    data-invalid={!!errors.isActive}>
                    <Checkbox
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      disabled={isSubmitting}
                      aria-invalid={!!errors.isActive}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="isActive">Ativa na loja</FieldLabel>
                      <FieldDescription>
                        Categorias inativas ficam ocultas na navegação pública.
                      </FieldDescription>
                      <FieldError
                        errors={errors.isActive ? [errors.isActive] : undefined}
                      />
                    </FieldContent>
                  </Field>
                )}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <Field data-invalid={!!errors.seoTitle}>
                  <FieldLabel htmlFor="seoTitle">Título SEO</FieldLabel>
                  <Input
                    id="seoTitle"
                    type="text"
                    placeholder="Blazers femininos | Clarisse"
                    aria-invalid={!!errors.seoTitle}
                    disabled={isSubmitting}
                    {...register("seoTitle")}
                  />
                  <FieldError
                    errors={errors.seoTitle ? [errors.seoTitle] : undefined}
                  />
                </Field>

                <Field data-invalid={!!errors.seoDescription}>
                  <FieldLabel htmlFor="seoDescription">
                    Descrição SEO
                  </FieldLabel>
                  <Textarea
                    id="seoDescription"
                    placeholder="Descubra blazers femininos sofisticados para rotina e ocasiões especiais."
                    rows={3}
                    aria-invalid={!!errors.seoDescription}
                    disabled={isSubmitting}
                    {...register("seoDescription")}
                  />
                  <FieldError
                    errors={
                      errors.seoDescription
                        ? [errors.seoDescription]
                        : undefined
                    }
                  />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>

          <CardFooter className="justify-end gap-2">
            <Button asChild variant="outline" disabled={isSubmitting}>
              <Link href="/admin/categories">Cancelar</Link>
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {!isSubmitting && <Save data-icon="inline-start" />}
              {submitLabel}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
