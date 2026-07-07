import "server-only";

import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  customers,
  inventoryMovements,
  orderItems,
  orders,
  paymentWebhookEvents,
  products,
  productVariants,
} from "@/db/schema";
import { mpPayment } from "@/lib/mercadopago";
import { CheckoutError } from "@/modules/checkout/server/errors";
import {
  mapMercadoPagoPaymentStatus,
  normalizeCheckoutItems,
} from "@/modules/checkout/utils";
import {
  amountToCents,
  getPaymentApprovedAt,
  getPaymentOrderId,
} from "@/modules/checkout/utils";
import type { CreateMercadoPagoCheckoutInput } from "@/modules/checkout/validations";
import type { MercadoPagoWebhookPayload } from "@/types/mercadopago";
import type { CheckoutLine } from "@/modules/checkout/types";

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

export const syncMercadoPagoPayment = async (paymentId: string) => {
  const payment = await mpPayment.get({ id: paymentId });
  const orderId = getPaymentOrderId(payment);
  const refundedCents = amountToCents(payment.transaction_amount_refunded);
  const transactionCents = amountToCents(payment.transaction_amount);
  const mapping = mapMercadoPagoPaymentStatus(
    payment.status,
    refundedCents,
    transactionCents,
  );

  if (!orderId) {
    console.warn("Mercado Pago payment without order reference", {
      paymentId,
      status: payment.status ?? null,
      statusDetail: payment.status_detail ?? null,
    });

    throw new CheckoutError(
      "Pagamento do Mercado Pago sem referência de pedido.",
      422,
    );
  }

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select id from ${orders} where ${orders.id} = ${orderId} for update`,
    );

    const [order] = await tx
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerId: orders.customerId,
        totalCents: orders.totalCents,
        paymentStatus: orders.paymentStatus,
        fulfillmentStatus: orders.fulfillmentStatus,
        paidAt: orders.paidAt,
        inventoryDeductedAt: orders.inventoryDeductedAt,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      console.warn("Mercado Pago payment order not found", {
        paymentId,
        orderId,
        status: payment.status ?? null,
      });

      throw new CheckoutError("Pedido não encontrado para o pagamento.", 404);
    }

    if (
      mapping.shouldDeductInventory &&
      transactionCents !== order.totalCents
    ) {
      console.warn("Mercado Pago payment total mismatch", {
        paymentId,
        orderId,
        orderTotalCents: order.totalCents,
        transactionCents,
      });

      throw new CheckoutError(
        "Valor pago no Mercado Pago não confere com o total do pedido.",
        409,
      );
    }

    const now = new Date();
    const paidAt =
      mapping.shouldDeductInventory && !order.paidAt
        ? getPaymentApprovedAt(payment)
        : undefined;
    const shouldCountCustomer =
      mapping.shouldDeductInventory && !order.paidAt && order.customerId;

    if (mapping.shouldDeductInventory && !order.inventoryDeductedAt) {
      const items = await tx
        .select({
          id: orderItems.id,
          productVariantId: orderItems.productVariantId,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      for (const item of items) {
        const [updatedVariant] = await tx
          .update(productVariants)
          .set({
            stockQuantity: sql`${productVariants.stockQuantity} - ${item.quantity}`,
          })
          .where(
            and(
              eq(productVariants.id, item.productVariantId),
              sql`${productVariants.stockQuantity} >= ${item.quantity}`,
            ),
          )
          .returning({
            id: productVariants.id,
          });

        if (!updatedVariant) {
          console.warn("Mercado Pago inventory deduction failed", {
            paymentId,
            orderId: order.id,
            orderNumber: order.orderNumber,
            productVariantId: item.productVariantId,
            requestedQuantity: item.quantity,
          });

          throw new CheckoutError(
            `Estoque insuficiente ao confirmar o pedido ${order.orderNumber}.`,
            409,
          );
        }
      }

      await tx.insert(inventoryMovements).values(
        items.map((item) => ({
          productVariantId: item.productVariantId,
          orderItemId: item.id,
          type: "sale" as const,
          quantityDelta: -item.quantity,
          reason: `Venda confirmada pelo Mercado Pago (${order.orderNumber})`,
          referenceType: "order",
          referenceId: order.id,
        })),
      );
    }

    if (shouldCountCustomer) {
      await tx
        .update(customers)
        .set({
          ordersCount: sql`${customers.ordersCount} + 1`,
          totalSpentCents: sql`${customers.totalSpentCents} + ${order.totalCents}`,
        })
        .where(eq(customers.id, order.customerId!));
    }

    const shouldUpdateFulfillment =
      mapping.fulfillmentStatus &&
      !["shipped", "delivered", "returned"].includes(order.fulfillmentStatus);

    await tx
      .update(orders)
      .set({
        status: mapping.orderStatus,
        paymentStatus: mapping.paymentStatus,
        ...(shouldUpdateFulfillment
          ? { fulfillmentStatus: mapping.fulfillmentStatus }
          : {}),
        mercadoPagoPaymentId: payment.id ? String(payment.id) : paymentId,
        mercadoPagoPaymentStatus: payment.status ?? null,
        mercadoPagoPaymentStatusDetail: payment.status_detail ?? null,
        mercadoPagoPaymentType: payment.payment_type_id ?? null,
        mercadoPagoPaymentMethodId: payment.payment_method_id ?? null,
        mercadoPagoMerchantOrderId: payment.order?.id
          ? String(payment.order.id)
          : null,
        mercadoPagoLiveMode:
          typeof payment.live_mode === "boolean" ? payment.live_mode : null,
        ...(paidAt ? { paidAt } : {}),
        ...(mapping.shouldDeductInventory && !order.inventoryDeductedAt
          ? { inventoryDeductedAt: now }
          : {}),
        ...(mapping.isTerminalFailure ? { canceledAt: now } : {}),
        ...(mapping.isRefund ? { refundedAt: now } : {}),
      })
      .where(eq(orders.id, order.id));

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentId: payment.id ? String(payment.id) : paymentId,
      mercadoPagoStatus: payment.status ?? null,
      orderStatus: mapping.orderStatus,
      paymentStatus: mapping.paymentStatus,
    };
  });
};

export const processMercadoPagoWebhook = async ({
  payload,
  resourceId,
  topic,
  action,
  xRequestId,
}: {
  payload: MercadoPagoWebhookPayload;
  resourceId: string;
  topic: string;
  action: string | null;
  xRequestId: string;
}) => {
  const [event] = await db
    .insert(paymentWebhookEvents)
    .values({
      provider: "mercadopago",
      providerEventId:
        payload.id === undefined || payload.id === null
          ? null
          : String(payload.id),
      resourceId,
      topic,
      action,
      xRequestId,
      payload,
    })
    .onConflictDoUpdate({
      target: [paymentWebhookEvents.provider, paymentWebhookEvents.xRequestId],
      set: {
        providerEventId:
          payload.id === undefined || payload.id === null
            ? null
            : String(payload.id),
        resourceId,
        topic,
        action,
        payload,
        updatedAt: new Date(),
      },
    })
    .returning({
      id: paymentWebhookEvents.id,
      processedAt: paymentWebhookEvents.processedAt,
    });

  if (!event) {
    throw new CheckoutError("Não foi possível registrar o webhook.", 500);
  }

  if (event.processedAt) {
    return {
      processed: false,
      duplicate: true,
    };
  }

  if (topic !== "payment") {
    await db
      .update(paymentWebhookEvents)
      .set({
        processedAt: new Date(),
        processingError: null,
      })
      .where(eq(paymentWebhookEvents.id, event.id));

    return {
      processed: false,
      duplicate: false,
      ignored: true,
    };
  }

  try {
    const result = await syncMercadoPagoPayment(resourceId);

    await db
      .update(paymentWebhookEvents)
      .set({
        processedAt: new Date(),
        processingError: null,
      })
      .where(eq(paymentWebhookEvents.id, event.id));

    return {
      processed: true,
      duplicate: false,
      result,
    };
  } catch (error) {
    console.error("Mercado Pago webhook processing failed", {
      resourceId,
      topic,
      action,
      xRequestId,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    });

    await db
      .update(paymentWebhookEvents)
      .set({
        processingError:
          error instanceof Error ? error.message : "Erro desconhecido",
      })
      .where(eq(paymentWebhookEvents.id, event.id));

    throw error;
  }
};
