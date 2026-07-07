import { z } from "zod";
import { CHECKOUT_MAX_ITEM_QUANTITY } from "@/modules/checkout/constants";

const trimmedString = z.string().trim();

export const checkoutItemInput = z.object({
  productVariantId: trimmedString.min(1),
  quantity: z.number().int().min(1).max(CHECKOUT_MAX_ITEM_QUANTITY),
});

export const createMercadoPagoCheckoutInput = z.object({
  items: z.array(checkoutItemInput).min(1).max(50),
  // The shipping address is one the logged-in customer already saved to their
  // account, so we only need its id — ownership is verified server-side.
  addressId: trimmedString.min(1),
  // Melhor Envio service id chosen by the customer. The price is re-quoted
  // server-side; only the service identity is trusted from the client.
  shippingServiceId: z.number().int().positive(),
});

export type CreateMercadoPagoCheckoutInput = z.infer<
  typeof createMercadoPagoCheckoutInput
>;
