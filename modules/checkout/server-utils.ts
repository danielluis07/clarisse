import "server-only";

import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  cartItems,
  carts,
  customers,
  inventoryMovements,
  orderItems,
  orders,
  paymentWebhookEvents,
  products,
  productVariants,
} from "@/db/schema";
import { getCurrentSession } from "@/lib/auth-utils";
import { env } from "@/lib/env";
import { mpPayment, mpPreference } from "@/lib/mercadopago";
import type { AddressSnapshot } from "@/types/db";
import {
  CHECKOUT_INSTALLMENTS,
  getCheckoutShippingCents,
} from "@/modules/checkout/constants";
import { mapMercadoPagoPaymentStatus } from "@/modules/checkout/payment-status";
import type { CreateMercadoPagoCheckoutInput } from "@/modules/checkout/validations";
import type {
  MercadoPagoPayment,
  MercadoPagoWebhookPayload,
} from "@/types/mercadopago";
import { CheckoutLine } from "@/modules/checkout/types";

export class CheckoutError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

const centsToMercadoPagoAmount = (cents: number) =>
  Number((cents / 100).toFixed(2));

const amountToCents = (amount: number | undefined) =>
  Math.round((amount ?? 0) * 100);

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = Bun.randomUUIDv7().slice(-6).toUpperCase();

  return `CLA-${timestamp}-${suffix}`;
};

const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const firstName = parts.shift() ?? name;
  const lastName = parts.join(" ");

  return {
    firstName,
    lastName,
  };
};

const splitBrazilPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");

  if (digits.length <= 2) {
    return { number: digits };
  }

  return {
    area_code: digits.slice(0, 2),
    number: digits.slice(2),
  };
};

const buildShippingAddress = (
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

const normalizeCheckoutItems = (
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

const getCheckoutLines = async (
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

export const createMercadoPagoCheckout = async (
  input: CreateMercadoPagoCheckoutInput,
) => {
  const [lines, session] = await Promise.all([
    getCheckoutLines(input.items),
    getCurrentSession(),
  ]);
  const customer = input.customer;
  const subtotalCents = lines.reduce(
    (total, line) => total + line.lineTotalCents,
    0,
  );
  const shippingCents = getCheckoutShippingCents(subtotalCents);
  const totalCents = subtotalCents + shippingCents;
  const shippingAddress = buildShippingAddress(customer);
  const sessionUserEmail = session?.user.email?.toLowerCase();
  const userId =
    session && sessionUserEmail === customer.email ? session.user.id : null;

  const createdOrder = await db.transaction(async (tx) => {
    const [customerRow] = await tx
      .insert(customers)
      .values({
        userId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      })
      .onConflictDoUpdate({
        target: customers.email,
        set: {
          name: customer.name,
          phone: customer.phone,
          userId: sql`coalesce(${customers.userId}, excluded.user_id)`,
          updatedAt: new Date(),
        },
      })
      .returning({
        id: customers.id,
      });

    if (!customerRow) {
      throw new CheckoutError("Não foi possível salvar o cliente.", 500);
    }

    const [cart] = await tx
      .insert(carts)
      .values({
        userId,
        customerId: customerRow.id,
        status: "converted",
        email: customer.email,
        currency: "BRL",
        subtotalCents,
        discountCents: 0,
        shippingCents,
        totalCents,
      })
      .returning({
        id: carts.id,
      });

    if (!cart) {
      throw new CheckoutError("Não foi possível criar a sacola.", 500);
    }

    await tx.insert(cartItems).values(
      lines.map((line) => ({
        cartId: cart.id,
        productVariantId: line.productVariantId,
        quantity: line.quantity,
        unitPriceCents: line.unitPriceCents,
        lineTotalCents: line.lineTotalCents,
      })),
    );

    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        userId,
        customerId: customerRow.id,
        cartId: cart.id,
        status: "pending",
        paymentStatus: "pending",
        fulfillmentStatus: "unfulfilled",
        paymentProvider: "mercadopago",
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        currency: "BRL",
        subtotalCents,
        discountCents: 0,
        shippingCents,
        taxCents: 0,
        totalCents,
        shippingAddress,
      })
      .returning({
        id: orders.id,
        orderNumber: orders.orderNumber,
      });

    if (!order) {
      throw new CheckoutError("Não foi possível criar o pedido.", 500);
    }

    await tx.insert(orderItems).values(
      lines.map((line) => ({
        orderId: order.id,
        productId: line.productId,
        productVariantId: line.productVariantId,
        productName: line.productName,
        productSlug: line.productSlug,
        variantSku: line.sku,
        colorName: line.colorName,
        colorHex: line.colorHex,
        size: line.size,
        quantity: line.quantity,
        unitPriceCents: line.unitPriceCents,
        compareAtPriceCents: line.compareAtPriceCents,
        lineTotalCents: line.lineTotalCents,
      })),
    );

    return order;
  });

  const appUrl =
    "https://ed23-2804-e24-fd5a-9f00-fd13-1c50-6b75-80d7.ngrok-free.app";
  const { firstName, lastName } = splitName(customer.name);
  const preference = await mpPreference.create({
    body: {
      items: lines.map((line) => ({
        id: line.productVariantId,
        title: `${line.productName} - ${line.colorName} / ${line.size}`,
        description: line.productSubtitle ?? line.productName,
        quantity: line.quantity,
        currency_id: "BRL",
        unit_price: centsToMercadoPagoAmount(line.unitPriceCents),
      })),
      shipments: {
        mode: "not_specified",
        cost: centsToMercadoPagoAmount(shippingCents),
        free_shipping: shippingCents === 0,
        receiver_address: {
          zip_code: customer.postalCode,
          street_name: customer.addressLine1,
          street_number: customer.number,
          apartment: customer.addressLine2 ?? undefined,
          city_name: customer.city,
          state_name: customer.state,
          country_name: "Brasil",
        },
      },
      payer: {
        name: firstName,
        surname: lastName,
        email: customer.email,
        phone: splitBrazilPhone(customer.phone),
        address: {
          zip_code: customer.postalCode,
          street_name: customer.addressLine1,
          street_number: customer.number,
        },
      },
      back_urls: {
        success: `${appUrl}/checkout/retorno?status=success&order_id=${createdOrder.id}`,
        pending: `${appUrl}/checkout/retorno?status=pending&order_id=${createdOrder.id}`,
        failure: `${appUrl}/checkout/retorno?status=failure&order_id=${createdOrder.id}`,
      },
      auto_return: "approved",
      external_reference: createdOrder.id,
      metadata: {
        order_id: createdOrder.id,
        order_number: createdOrder.orderNumber,
      },
      payment_methods: {
        installments: CHECKOUT_INSTALLMENTS,
      },
      statement_descriptor: "CLARISSE",
    },
  });

  const initPoint =
    env.MP_ACCESS_TOKEN.startsWith("TEST-") && preference.sandbox_init_point
      ? preference.sandbox_init_point
      : (preference.init_point ?? preference.sandbox_init_point);

  if (!preference.id || !initPoint) {
    console.error(
      "Mercado Pago checkout preference was not created correctly",
      {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        preferenceId: preference.id ?? null,
        hasInitPoint: Boolean(initPoint),
      },
    );

    throw new CheckoutError(
      "O Mercado Pago não retornou uma preferência válida.",
      502,
    );
  }

  await db
    .update(orders)
    .set({
      mercadoPagoPreferenceId: preference.id,
    })
    .where(eq(orders.id, createdOrder.id));

  return {
    orderId: createdOrder.id,
    orderNumber: createdOrder.orderNumber,
    preferenceId: preference.id,
    initPoint,
  };
};

const getPaymentOrderId = (payment: MercadoPagoPayment) => {
  const metadata = payment.metadata as
    | { order_id?: string; order_number?: string }
    | undefined;

  return payment.external_reference ?? metadata?.order_id ?? null;
};

const getPaymentApprovedAt = (payment: MercadoPagoPayment) => {
  if (!payment.date_approved) return new Date();

  const date = new Date(payment.date_approved);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

export const syncMercadoPagoPayment = async (paymentId: string) => {
  console.info("Starting Mercado Pago payment sync", {
    paymentId,
  });

  const payment = await mpPayment.get({ id: paymentId });
  const orderId = getPaymentOrderId(payment);
  const refundedCents = amountToCents(payment.transaction_amount_refunded);
  const transactionCents = amountToCents(payment.transaction_amount);
  const mapping = mapMercadoPagoPaymentStatus(
    payment.status,
    refundedCents,
    transactionCents,
  );

  console.info("Loaded Mercado Pago payment for sync", {
    paymentId,
    orderId,
    status: payment.status ?? null,
    statusDetail: payment.status_detail ?? null,
    transactionAmountCents: transactionCents,
    refundedAmountCents: refundedCents,
    shouldDeductInventory: mapping.shouldDeductInventory,
    isRefund: mapping.isRefund,
    isTerminalFailure: mapping.isTerminalFailure,
    orderStatus: mapping.orderStatus,
    paymentStatus: mapping.paymentStatus,
    fulfillmentStatus: mapping.fulfillmentStatus ?? null,
  });

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
    console.info("Synchronizing Mercado Pago payment inside transaction", {
      paymentId,
      orderId,
    });

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

    console.info("Resolved Mercado Pago sync order state", {
      paymentId,
      orderId,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      paidAt: order.paidAt,
      inventoryDeductedAt: order.inventoryDeductedAt,
      shouldDeductInventory: mapping.shouldDeductInventory,
      shouldCountCustomer: Boolean(shouldCountCustomer),
      paidAtWillBeSet: Boolean(paidAt),
    });

    if (mapping.shouldDeductInventory && !order.inventoryDeductedAt) {
      const items = await tx
        .select({
          id: orderItems.id,
          productVariantId: orderItems.productVariantId,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      console.info("Deducting inventory for Mercado Pago payment", {
        paymentId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        itemCount: items.length,
      });

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

      console.info("Finished inventory deduction for Mercado Pago payment", {
        paymentId,
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    }

    if (shouldCountCustomer) {
      console.info("Updating customer totals for Mercado Pago payment", {
        paymentId,
        orderId: order.id,
        customerId: order.customerId,
        totalCents: order.totalCents,
      });

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

    console.info("Updated order from Mercado Pago payment sync", {
      paymentId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderStatus: mapping.orderStatus,
      paymentStatus: mapping.paymentStatus,
      fulfillmentStatus: mapping.fulfillmentStatus ?? null,
      inventoryDeducted:
        mapping.shouldDeductInventory && !order.inventoryDeductedAt,
      customerCounted: Boolean(shouldCountCustomer),
    });

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
