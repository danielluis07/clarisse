"use client";

import { Control, Controller, Path } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  type ProductFormInput,
  type ProductFormOutput,
} from "@/modules/products/form-schema";

export const VariantNumberField = ({
  id,
  label,
  disabled,
  error,
  control,
  name,
  step,
}: {
  id: string;
  label: string;
  disabled: boolean;
  error?: { message?: string };
  control: Control<ProductFormInput, unknown, ProductFormOutput>;
  name: Path<ProductFormInput>;
  step: string;
}) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { value, ...fieldProps } }) => (
      <Field data-invalid={!!error} className="gap-1">
        <FieldLabel htmlFor={id} className="sr-only">
          {label}
        </FieldLabel>
        <Input
          id={id}
          type="number"
          min="0"
          step={step}
          inputMode={step === "1" ? "numeric" : "decimal"}
          aria-invalid={!!error}
          disabled={disabled}
          value={(value as string) ?? ""}
          {...fieldProps}
        />
        <FieldError errors={error ? [error] : undefined} />
      </Field>
    )}
  />
);
