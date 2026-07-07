"use client";

import { X } from "lucide-react";
import { Control, Controller, FieldErrors } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  type ProductFormInput,
  type ProductFormOutput,
} from "@/modules/products/form-schema";
import { VariantAmountField } from "@/modules/products/components/admin/form/product-variant-amount-field";
import { VariantNumberField } from "@/modules/products/components/admin/form/product-number-field";

export const ProductFormVariantRow = ({
  index,
  canRemove,
  disabled,
  errors,
  control,
  onRemove,
}: {
  index: number;
  canRemove: boolean;
  disabled: boolean;
  errors: FieldErrors<ProductFormInput>;
  control: Control<ProductFormInput, unknown, ProductFormOutput>;
  onRemove: () => void;
}) => {
  const variantErrors = errors.variants?.[index];
  const colorHex = variantErrors?.colorHex;

  return (
    <TableRow>
      <TableCell>
        <Controller
          control={control}
          name={`variants.${index}.id`}
          render={({ field }) => (
            <input type="hidden" {...field} value={field.value ?? ""} />
          )}
        />
        <Controller
          control={control}
          name={`variants.${index}.sku`}
          render={({ field }) => (
            <Field data-invalid={!!variantErrors?.sku} className="gap-1">
              <FieldLabel htmlFor={`variant-${index}-sku`} className="sr-only">
                SKU
              </FieldLabel>
              <Input
                id={`variant-${index}-sku`}
                aria-invalid={!!variantErrors?.sku}
                disabled={disabled}
                {...field}
              />
              <FieldError
                errors={variantErrors?.sku ? [variantErrors.sku] : undefined}
              />
            </Field>
          )}
        />
      </TableCell>
      <TableCell>
        <Controller
          control={control}
          name={`variants.${index}.colorName`}
          render={({ field }) => (
            <Field data-invalid={!!variantErrors?.colorName} className="gap-1">
              <FieldLabel
                htmlFor={`variant-${index}-colorName`}
                className="sr-only">
                Cor
              </FieldLabel>
              <Input
                id={`variant-${index}-colorName`}
                aria-invalid={!!variantErrors?.colorName}
                disabled={disabled}
                {...field}
              />
              <FieldError
                errors={
                  variantErrors?.colorName
                    ? [variantErrors.colorName]
                    : undefined
                }
              />
            </Field>
          )}
        />
      </TableCell>
      <TableCell>
        <Field data-invalid={!!colorHex} className="gap-1">
          <FieldLabel htmlFor={`variant-${index}-colorHex`} className="sr-only">
            Hex
          </FieldLabel>
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name={`variants.${index}.colorHex`}
              render={({ field }) => (
                <>
                  <span
                    aria-hidden
                    className={cn(
                      "size-5 shrink-0 rounded-full border",
                      !/^#[0-9a-fA-F]{6}$/.test(field.value ?? "") &&
                        "bg-muted",
                    )}
                    style={
                      /^#[0-9a-fA-F]{6}$/.test(field.value ?? "")
                        ? { backgroundColor: field.value }
                        : undefined
                    }
                  />
                  <Input
                    id={`variant-${index}-colorHex`}
                    {...field}
                    onChange={field.onChange}
                    aria-invalid={!!colorHex}
                    disabled={disabled}
                    placeholder="#111111"
                  />
                </>
              )}
            />
          </div>
          <FieldError errors={colorHex ? [colorHex] : undefined} />
        </Field>
      </TableCell>
      <TableCell>
        <Controller
          control={control}
          name={`variants.${index}.size`}
          render={({ field }) => (
            <Field data-invalid={!!variantErrors?.size} className="gap-1">
              <FieldLabel htmlFor={`variant-${index}-size`} className="sr-only">
                Tamanho
              </FieldLabel>
              <Input
                id={`variant-${index}-size`}
                aria-invalid={!!variantErrors?.size}
                disabled={disabled}
                {...field}
              />
              <FieldError
                errors={variantErrors?.size ? [variantErrors.size] : undefined}
              />
            </Field>
          )}
        />
      </TableCell>
      <TableCell>
        <VariantAmountField
          id={`variant-${index}-price`}
          label="Preço"
          disabled={disabled}
          error={variantErrors?.price}
          control={control}
          name={`variants.${index}.price`}
        />
      </TableCell>
      <TableCell>
        <VariantAmountField
          id={`variant-${index}-compareAtPrice`}
          label="Comparação"
          disabled={disabled}
          error={variantErrors?.compareAtPrice}
          control={control}
          name={`variants.${index}.compareAtPrice`}
        />
      </TableCell>
      <TableCell>
        <VariantNumberField
          id={`variant-${index}-stockQuantity`}
          label="Estoque"
          disabled={disabled}
          error={variantErrors?.stockQuantity}
          control={control}
          name={`variants.${index}.stockQuantity`}
          step="1"
        />
      </TableCell>
      <TableCell>
        <VariantNumberField
          id={`variant-${index}-lowStockThreshold`}
          label="Estoque baixo"
          disabled={disabled}
          error={variantErrors?.lowStockThreshold}
          control={control}
          name={`variants.${index}.lowStockThreshold`}
          step="1"
        />
      </TableCell>
      <TableCell>
        <VariantNumberField
          id={`variant-${index}-weightGrams`}
          label="Peso"
          disabled={disabled}
          error={variantErrors?.weightGrams}
          control={control}
          name={`variants.${index}.weightGrams`}
          step="1"
        />
      </TableCell>
      <TableCell>
        <Controller
          control={control}
          name={`variants.${index}.isActive`}
          render={({ field }) => (
            <Field orientation="horizontal" className="min-w-24 gap-2">
              <Checkbox
                id={`variant-${index}-isActive`}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                disabled={disabled}
              />
              <FieldLabel
                htmlFor={`variant-${index}-isActive`}
                className="font-normal">
                Ativa
              </FieldLabel>
            </Field>
          )}
        />
      </TableCell>
      <TableCell>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled || !canRemove}
          onClick={onRemove}
          aria-label="Remover variante">
          <X />
        </Button>
      </TableCell>
    </TableRow>
  );
};
