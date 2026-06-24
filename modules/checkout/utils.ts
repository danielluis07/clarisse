import { env } from "@/lib/env";
import type { AddressSnapshot } from "@/types/db";
import type { CreateMercadoPagoCheckoutInput } from "@/modules/checkout/validations";

export const getCheckoutAppUrl = () =>
  process.env.NODE_ENV === "production"
    ? env.NEXT_PUBLIC_APP_URL
    : env.NGROK_URL ?? env.NEXT_PUBLIC_APP_URL;

export const centsToMercadoPagoAmount = (cents: number) =>
  Number((cents / 100).toFixed(2));

export const amountToCents = (amount: number | undefined) =>
  Math.round((amount ?? 0) * 100);

export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = Bun.randomUUIDv7().slice(-6).toUpperCase();

  return `CLA-${timestamp}-${suffix}`;
};

export const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const firstName = parts.shift() ?? name;
  const lastName = parts.join(" ");

  return {
    firstName,
    lastName,
  };
};

export const splitBrazilPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");

  if (digits.length <= 2) {
    return { number: digits };
  }

  return {
    area_code: digits.slice(0, 2),
    number: digits.slice(2),
  };
};

export const buildShippingAddress = (
  customer: CreateMercadoPagoCheckoutInput["customer"],
): AddressSnapshot => ({
  recipientName: customer.name,
  phone: customer.phone,
  country: "BR",
  postalCode: customer.postalCode,
  state: customer.state,
  city: customer.city,
  neighborhood: customer.neighborhood,
  addressLine1: customer.addressLine1,
  addressLine2: customer.addressLine2,
  number: customer.number,
});

export const normalizeCheckoutItems = (
  items: CreateMercadoPagoCheckoutInput["items"],
) => {
  const quantitiesByVariantId = new Map<string, number>();

  for (const item of items) {
    quantitiesByVariantId.set(
      item.productVariantId,
      (quantitiesByVariantId.get(item.productVariantId) ?? 0) + item.quantity,
    );
  }

  return Array.from(quantitiesByVariantId, ([productVariantId, quantity]) => ({
    productVariantId,
    quantity,
  }));
};

export const getPaymentOrderId = (payment: {
  external_reference?: string | null;
  metadata?: unknown;
}) => {
  const metadata = payment.metadata as
    | { order_id?: string; order_number?: string }
    | undefined;

  return payment.external_reference ?? metadata?.order_id ?? null;
};

export const getPaymentApprovedAt = (payment: {
  date_approved?: string | null;
}) => {
  if (!payment.date_approved) return new Date();

  const date = new Date(payment.date_approved);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};
