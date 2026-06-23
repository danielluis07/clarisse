import { z } from "zod";
import { CHECKOUT_MAX_ITEM_QUANTITY } from "@/modules/checkout/constants";

const trimmedString = z.string().trim();

const optionalTrimmedString = (max = 160) =>
  trimmedString
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

export const checkoutCustomerInput = z.object({
  email: z.email().max(254).transform((value) => value.toLowerCase()),
  name: trimmedString.min(2).max(120),
  phone: trimmedString.min(8).max(32),
  postalCode: trimmedString.min(8).max(16),
  state: trimmedString
    .min(2)
    .max(2)
    .transform((value) => value.toUpperCase()),
  city: trimmedString.min(2).max(80),
  neighborhood: trimmedString.min(2).max(80),
  addressLine1: trimmedString.min(2).max(160),
  addressLine2: optionalTrimmedString(120),
  number: trimmedString.min(1).max(20),
});

export const checkoutItemInput = z.object({
  productVariantId: trimmedString.min(1),
  quantity: z.number().int().min(1).max(CHECKOUT_MAX_ITEM_QUANTITY),
});

export const createMercadoPagoCheckoutInput = z.object({
  items: z.array(checkoutItemInput).min(1).max(50),
  customer: checkoutCustomerInput,
});

export type CreateMercadoPagoCheckoutInput = z.infer<
  typeof createMercadoPagoCheckoutInput
>;
