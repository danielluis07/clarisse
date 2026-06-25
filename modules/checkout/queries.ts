import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { CheckoutError } from "@/modules/checkout/errors";
import type { CreateMercadoPagoCheckoutInput } from "@/modules/checkout/validations";
import { normalizeCheckoutItems } from "@/modules/checkout/utils";
import { CheckoutLine } from "@/modules/checkout/types";

export const getCheckoutLines = async (
  inputItems: CreateMercadoPagoCheckoutInput["items"],
): Promise<CheckoutLine[]> => {
  const items = normalizeCheckoutItems(inputItems);
  const variantIds = items.map((item) => item.productVariantId);

  const rows = await db
    .select({
      productVariantId: productVariants.id,
      productId: productVariants.productId,
      productName: products.name,
      productSlug: products.slug,
      productSubtitle: products.subtitle,
      productStatus: products.status,
      basePriceCents: products.basePriceCents,
      productCompareAtPriceCents: products.compareAtPriceCents,
      currency: products.currency,
      sku: productVariants.sku,
      colorName: productVariants.colorName,
      colorHex: productVariants.colorHex,
      size: productVariants.size,
      priceCents: productVariants.priceCents,
      compareAtPriceCents: productVariants.compareAtPriceCents,
      stockQuantity: productVariants.stockQuantity,
      isActive: productVariants.isActive,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(
      and(
        inArray(productVariants.id, variantIds),
        eq(productVariants.isActive, true),
        eq(products.status, "active"),
      ),
    );

  const rowsByVariantId = new Map(
    rows.map((row) => [row.productVariantId, row]),
  );

  return items.map((item) => {
    const row = rowsByVariantId.get(item.productVariantId);

    if (!row) {
      console.warn("Checkout item no longer available", {
        productVariantId: item.productVariantId,
        quantity: item.quantity,
      });

      throw new CheckoutError(
        "Um dos itens da sacola não está mais disponível.",
        409,
      );
    }

    if (row.currency !== "BRL") {
      console.warn("Checkout item currency mismatch", {
        productVariantId: row.productVariantId,
        currency: row.currency,
      });

      throw new CheckoutError(
        "O Mercado Pago está configurado para pedidos em BRL.",
        409,
      );
    }

    if (row.stockQuantity < item.quantity) {
      console.warn("Checkout item stock insufficient", {
        productVariantId: row.productVariantId,
        productName: row.productName,
        requestedQuantity: item.quantity,
        stockQuantity: row.stockQuantity,
      });

      throw new CheckoutError(
        `Estoque insuficiente para ${row.productName} (${row.colorName} / ${row.size}).`,
        409,
      );
    }

    const unitPriceCents = row.priceCents ?? row.basePriceCents;
    const compareAtPriceCents =
      row.compareAtPriceCents ?? row.productCompareAtPriceCents;

    return {
      productVariantId: row.productVariantId,
      productId: row.productId,
      productName: row.productName,
      productSlug: row.productSlug,
      productSubtitle: row.productSubtitle,
      sku: row.sku,
      colorName: row.colorName,
      colorHex: row.colorHex,
      size: row.size,
      quantity: item.quantity,
      unitPriceCents,
      compareAtPriceCents,
      lineTotalCents: unitPriceCents * item.quantity,
      currency: row.currency,
    };
  });
};
