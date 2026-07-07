export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled"
  | "refunded";

export type PaymentStatus =
  "pending" | "paid" | "failed" | "refunded" | "partially_refunded";

export type FulfillmentStatus =
  | "unfulfilled"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled"
  | "returned";

export type CheckoutLine = {
  productVariantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  productSubtitle: string | null;
  sku: string;
  colorName: string;
  colorHex: string | null;
  size: string;
  quantity: number;
  unitPriceCents: number;
  compareAtPriceCents: number | null;
  lineTotalCents: number;
  currency: string;
};
