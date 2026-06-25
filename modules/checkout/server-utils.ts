import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  cartItems,
  carts,
  customers,
  inventoryMovements,
  orderItems,
  orders,
  paymentWebhookEvents,
  productVariants,
} from "@/db/schema";
import { getCurrentSession } from "@/lib/auth-utils";
import { mpPayment, mpPreference } from "@/lib/mercadopago";
import { getCheckoutShippingCents } from "@/modules/checkout/constants";
import { CheckoutError } from "@/modules/checkout/errors";
import { mapMercadoPagoPaymentStatus } from "@/modules/checkout/utils";
import { getCheckoutLines } from "@/modules/checkout/queries";
import {
  buildShippingAddress,
  centsToMercadoPagoAmount,
  amountToCents,
  generateOrderNumber,
  getCheckoutAppUrl,
  getPaymentApprovedAt,
  getPaymentOrderId,
  splitBrazilPhone,
  splitName,
} from "@/modules/checkout/utils";
import type { CreateMercadoPagoCheckoutInput } from "@/modules/checkout/validations";
import type { MercadoPagoWebhookPayload } from "@/types/mercadopago";

export { CheckoutError } from "@/modules/checkout/errors";

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

  const appUrl = getCheckoutAppUrl();
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
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      auto_return: "approved",
      external_reference: createdOrder.id,
      metadata: {
        order_id: createdOrder.id,
        order_number: createdOrder.orderNumber,
      },
      statement_descriptor: "CLARISSE",
    },
  });

  const initPoint = preference.init_point;

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
