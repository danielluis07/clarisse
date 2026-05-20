"use client";

import type { ReactNode } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";

import {
  ProductImagesField,
  type ProductImageSlot,
} from "@/components/media/product-images-field";
import {
  Card,
  CardContent,
  CardDescription,
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
  FieldLegend,
  FieldSet,
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
import { Textarea } from "@/components/ui/textarea";
import {
  type ProductFormInput,
  type ProductFormOutput,
} from "@/modules/products/form-schema";
import { centsToReais, formatReaisInput } from "@/lib/utils";

const NONE_VALUE = "__none";

const toReaisDisplayValue = (value: string | number | null | undefined) => {
  if (value == null || value === "") return "";
  if (typeof value === "number") return centsToReais(value);

  return value;
};

export const ProductFormGrid = ({
  control,
  errors,
  isSubmitting,
  imageSlots,
  onImageSlotsChange,
  onAssetRemoved,
  options,
  variantsSlot,
}: {
  control: Control<ProductFormInput, unknown, ProductFormOutput>;
  errors: FieldErrors<ProductFormInput>;
  isSubmitting: boolean;
  imageSlots: ProductImageSlot[];
  onImageSlotsChange: (slots: ProductImageSlot[]) => void;
  onAssetRemoved: (assetId: string) => void;
  options: {
    categories: Array<{ id: string; name: string; isActive: boolean }>;
    collections: Array<{
      id: string;
      name: string;
      slug: string;
      isActive: boolean;
      isFeatured: boolean;
    }>;
  };
  variantsSlot: ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="font-admin">Informações editoriais</CardTitle>
          <CardDescription>
            Conteúdo principal apresentado no cadastro e na vitrine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">Nome</FieldLabel>
                  <Input
                    id="name"
                    placeholder="Blazer Aurora"
                    autoComplete="off"
                    aria-invalid={!!errors.name}
                    disabled={isSubmitting}
                    {...field}
                  />
                  <FieldError
                    errors={errors.name ? [errors.name] : undefined}
                  />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="subtitle"
              render={({ field }) => (
                <Field data-invalid={!!errors.subtitle}>
                  <FieldLabel htmlFor="subtitle">Subtítulo</FieldLabel>
                  <Input
                    id="subtitle"
                    placeholder="Alfaiataria leve em lã fria"
                    autoComplete="off"
                    aria-invalid={!!errors.subtitle}
                    disabled={isSubmitting}
                    {...field}
                  />
                  <FieldError
                    errors={errors.subtitle ? [errors.subtitle] : undefined}
                  />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Field data-invalid={!!errors.description}>
                  <FieldLabel htmlFor="description">Descrição</FieldLabel>
                  <Textarea
                    id="description"
                    rows={7}
                    placeholder="Descreva a peça, o caimento e as ocasiões de uso."
                    aria-invalid={!!errors.description}
                    disabled={isSubmitting}
                    {...field}
                  />
                  <FieldError
                    errors={
                      errors.description ? [errors.description] : undefined
                    }
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="font-admin">Publicação</CardTitle>
            <CardDescription>Status comercial do produto.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Field data-invalid={!!errors.status}>
                    <FieldLabel>Status</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}>
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={!!errors.status}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="archived">Arquivado</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError
                      errors={errors.status ? [errors.status] : undefined}
                    />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="isFeatured"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      disabled={isSubmitting}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="isFeatured">
                        Produto em destaque
                      </FieldLabel>
                      <FieldDescription>
                        Prioriza esta peça em vitrines editoriais.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="font-admin">Organização</CardTitle>
            <CardDescription>
              Categoria estrutural e coleções comerciais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Field data-invalid={!!errors.categoryId}>
                    <FieldLabel>Categoria</FieldLabel>
                    <Select
                      value={field.value ?? NONE_VALUE}
                      onValueChange={(value) =>
                        field.onChange(value === NONE_VALUE ? null : value)
                      }
                      disabled={isSubmitting}>
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={!!errors.categoryId}>
                        <SelectValue placeholder="Selecionar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={NONE_VALUE}>
                            Sem categoria
                          </SelectItem>
                          {options.categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                              {!category.isActive ? " (inativa)" : ""}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError
                      errors={
                        errors.categoryId ? [errors.categoryId] : undefined
                      }
                    />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="collectionIds"
                render={({ field }) => (
                  <FieldSet>
                    <FieldLegend variant="label">Coleções</FieldLegend>
                    <FieldDescription>
                      Agrupamentos editoriais e campanhas.
                    </FieldDescription>
                    <FieldGroup className="gap-3">
                      {options.collections.length ? (
                        options.collections.map((collection) => {
                          const checked = field.value.includes(collection.id);

                          return (
                            <Field key={collection.id} orientation="horizontal">
                              <Checkbox
                                id={`collection-${collection.id}`}
                                checked={checked}
                                onCheckedChange={(nextChecked) => {
                                  field.onChange(
                                    nextChecked
                                      ? [...field.value, collection.id]
                                      : field.value.filter(
                                          (id) => id !== collection.id,
                                        ),
                                  );
                                }}
                                disabled={isSubmitting}
                              />
                              <FieldContent>
                                <FieldLabel
                                  htmlFor={`collection-${collection.id}`}>
                                  {collection.name}
                                </FieldLabel>
                                <FieldDescription>
                                  {collection.isFeatured
                                    ? "Coleção em destaque"
                                    : collection.slug}
                                  {!collection.isActive ? " / inativa" : ""}
                                </FieldDescription>
                              </FieldContent>
                            </Field>
                          );
                        })
                      ) : (
                        <FieldDescription>
                          Nenhuma coleção cadastrada.
                        </FieldDescription>
                      )}
                    </FieldGroup>
                  </FieldSet>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="font-admin">Preços</CardTitle>
          <CardDescription>Valores base em BRL.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-3">
              <Controller
                control={control}
                name="basePrice"
                render={({ field }) => (
                  <Field data-invalid={!!errors.basePrice}>
                    <FieldLabel htmlFor="basePrice">Preço base</FieldLabel>
                    <Input
                      id="basePrice"
                      type="text"
                      placeholder="R$ 489,00"
                      aria-invalid={!!errors.basePrice}
                      disabled={isSubmitting}
                      {...field}
                      value={toReaisDisplayValue(field.value)}
                      onChange={(e) => formatReaisInput(e, field)}
                    />
                    <FieldError
                      errors={
                        errors.basePrice ? [errors.basePrice] : undefined
                      }
                    />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="compareAtPrice"
                render={({ field }) => (
                  <Field data-invalid={!!errors.compareAtPrice}>
                    <FieldLabel htmlFor="compareAtPrice">
                      Preço comparativo
                    </FieldLabel>
                    <Input
                      id="compareAtPrice"
                      type="text"
                      inputMode="decimal"
                      placeholder="R$ 589,00"
                      aria-invalid={!!errors.compareAtPrice}
                      disabled={isSubmitting}
                      {...field}
                      value={toReaisDisplayValue(field.value)}
                      onChange={(e) => formatReaisInput(e, field)}
                    />
                    <FieldError
                      errors={
                        errors.compareAtPrice
                          ? [errors.compareAtPrice]
                          : undefined
                      }
                    />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="cost"
                render={({ field }) => (
                  <Field data-invalid={!!errors.cost}>
                    <FieldLabel htmlFor="cost">Custo interno</FieldLabel>
                    <Input
                      id="cost"
                      type="text"
                      inputMode="decimal"
                      placeholder="R$ 210,00"
                      aria-invalid={!!errors.cost}
                      disabled={isSubmitting}
                      {...field}
                      value={toReaisDisplayValue(field.value)}
                      onChange={(e) => formatReaisInput(e, field)}
                    />
                    <FieldError
                      errors={errors.cost ? [errors.cost] : undefined}
                    />
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="font-admin">Imagens</CardTitle>
          <CardDescription>
            Fotos de produto, detalhes e variações visuais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel>Galeria do produto</FieldLabel>
            <ProductImagesField
              value={imageSlots}
              onChange={onImageSlotsChange}
              onAssetRemoved={onAssetRemoved}
              disabled={isSubmitting}
              maxImages={12}
            />
          </Field>
        </CardContent>
      </Card>

      {variantsSlot}

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="font-admin">Detalhes da peça</CardTitle>
          <CardDescription>
            Informações de composição, caimento e cuidados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              control={control}
              name="material"
              render={({ field }) => (
                <Field data-invalid={!!errors.material}>
                  <FieldLabel htmlFor="material">Material</FieldLabel>
                  <Textarea
                    id="material"
                    rows={3}
                    placeholder="Lã fria, viscose e elastano."
                    aria-invalid={!!errors.material}
                    disabled={isSubmitting}
                    {...field}
                  />
                  <FieldError
                    errors={errors.material ? [errors.material] : undefined}
                  />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="fit"
              render={({ field }) => (
                <Field data-invalid={!!errors.fit}>
                  <FieldLabel htmlFor="fit">Modelagem</FieldLabel>
                  <Textarea
                    id="fit"
                    rows={3}
                    placeholder="Corte levemente acinturado, ombros estruturados."
                    aria-invalid={!!errors.fit}
                    disabled={isSubmitting}
                    {...field}
                  />
                  <FieldError
                    errors={errors.fit ? [errors.fit] : undefined}
                  />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="careInstructions"
              render={({ field }) => (
                <Field data-invalid={!!errors.careInstructions}>
                  <FieldLabel htmlFor="careInstructions">Cuidados</FieldLabel>
                  <Textarea
                    id="careInstructions"
                    rows={3}
                    placeholder="Lavagem a seco. Não alvejar."
                    aria-invalid={!!errors.careInstructions}
                    disabled={isSubmitting}
                    {...field}
                  />
                  <FieldError
                    errors={
                      errors.careInstructions
                        ? [errors.careInstructions]
                        : undefined
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
          <CardTitle className="font-admin">SEO</CardTitle>
          <CardDescription>
            Metadados para páginas de produto e compartilhamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              control={control}
              name="seoTitle"
              render={({ field }) => (
                <Field data-invalid={!!errors.seoTitle}>
                  <FieldLabel htmlFor="seoTitle">Título SEO</FieldLabel>
                  <Input
                    id="seoTitle"
                    placeholder="Blazer Aurora | Clarisse"
                    aria-invalid={!!errors.seoTitle}
                    disabled={isSubmitting}
                    {...field}
                  />
                  <FieldError
                    errors={errors.seoTitle ? [errors.seoTitle] : undefined}
                  />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="seoDescription"
              render={({ field }) => (
                <Field data-invalid={!!errors.seoDescription}>
                  <FieldLabel htmlFor="seoDescription">
                    Descrição SEO
                  </FieldLabel>
                  <Textarea
                    id="seoDescription"
                    rows={3}
                    placeholder="Blazer feminino premium com alfaiataria leve para composições elegantes."
                    aria-invalid={!!errors.seoDescription}
                    disabled={isSubmitting}
                    {...field}
                  />
                  <FieldError
                    errors={
                      errors.seoDescription
                        ? [errors.seoDescription]
                        : undefined
                    }
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
};
