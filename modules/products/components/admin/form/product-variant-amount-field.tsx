"use client";

import { Control, Controller, Path } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { centsToReais, formatReaisInput } from "@/lib/utils";
import {
  type ProductFormInput,
  type ProductFormOutput,
} from "@/modules/products/form-schema";

const toReaisDisplayValue = (value: string | number | null | undefined) => {
  if (value == null || value === "") return "";
  if (typeof value === "number") return centsToReais(value);

  return value;
};

export const VariantAmountField = ({
  id,
  label,
  disabled,
  error,
  control,
  name,
}: {
  id: string;
  label: string;
  disabled: boolean;
  error?: { message?: string };
  control: Control<ProductFormInput, unknown, ProductFormOutput>;
  name: Path<ProductFormInput>;
}) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { value, onBlur, onChange, ...fieldProps } }) => {
      const displayValue =
        typeof value === "string" || typeof value === "number"
          ? value
          : undefined;

      return (
        <Field data-invalid={!!error} className="gap-1">
          <FieldLabel htmlFor={id} className="sr-only">
            {label}
          </FieldLabel>
          <Input
            id={id}
            type="text"
            inputMode="decimal"
            aria-invalid={!!error}
            disabled={disabled}
            placeholder="R$ 0,00"
            value={toReaisDisplayValue(displayValue)}
            onBlur={onBlur}
            onChange={(event) => formatReaisInput(event, { onChange })}
            {...fieldProps}
          />
          <FieldError errors={error ? [error] : undefined} />
        </Field>
      );
    }}
  />
);
