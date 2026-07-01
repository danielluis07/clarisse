import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
    .nullable()
    .optional();

/** Brazilian postal code — accepts "01001-000" or "01001000", stored as digits. */
export const postalCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ""))
  .refine((value) => value.length === 8, {
    message: "CEP deve conter 8 dígitos.",
  });

const optionalPostalCode = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ""))
  .refine((value) => value === "" || value.length === 8, {
    message: "CEP deve conter 8 dígitos.",
  })
  .transform((value) => value || null)
  .nullable()
  .optional();

const positiveCm = (label: string) =>
  z
    .number()
    .int(`${label} deve ser um número inteiro.`)
    .min(1, `${label} deve ser maior que zero.`)
    .max(105, `${label} excede o limite das transportadoras.`);

export const updateShippingSettingsInput = z.object({
  // Origin / sender
  originPostalCode: optionalPostalCode,
  senderName: optionalText(120),
  senderDocument: optionalText(20),
  senderPhone: optionalText(20),
  senderEmail: z
    .union([z.email("E-mail inválido."), z.literal("")])
    .transform((value) => value || null)
    .nullable()
    .optional(),
  senderAddressLine1: optionalText(160),
  senderNumber: optionalText(20),
  senderComplement: optionalText(120),
  senderNeighborhood: optionalText(80),
  senderCity: optionalText(80),
  senderState: optionalText(2),
  // Default package
  defaultPackageHeightCm: positiveCm("Altura"),
  defaultPackageWidthCm: positiveCm("Largura"),
  defaultPackageLengthCm: positiveCm("Comprimento"),
  defaultPackageWeightGrams: z
    .number()
    .int("Peso deve ser um número inteiro.")
    .min(1, "Peso deve ser maior que zero."),
  // Free shipping
  freeShippingEnabled: z.boolean(),
  freeShippingThresholdCents: z
    .number()
    .int("Limite deve ser um número inteiro em centavos.")
    .min(0, "Limite não pode ser negativo."),
});

export type UpdateShippingSettingsInput = z.infer<
  typeof updateShippingSettingsInput
>;
export type ShippingSettingsFormInput = z.input<
  typeof updateShippingSettingsInput
>;

/** Storefront quote request (ready for Phase 2 checkout wiring). */
export const calculateQuoteInput = z.object({
  toPostalCode: postalCodeSchema,
  items: z
    .array(
      z.object({
        productVariantId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Informe ao menos um item para cotar o frete."),
});

export type CalculateQuoteInput = z.infer<typeof calculateQuoteInput>;
