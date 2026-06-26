import { db } from "@/db";
import { cartItems, carts, customers, orderItems, orders } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, sql } from "drizzle-orm";
import { createMercadoPagoCheckoutInput } from "@/modules/checkout/validations";
import { getCheckoutShippingCents } from "@/modules/checkout/constants";
import {
  buildShippingAddress,
  centsToMercadoPagoAmount,
  generateOrderNumber,
  getCheckoutAppUrl,
  splitBrazilPhone,
  splitName,
} from "@/modules/checkout/utils";
import { CheckoutError } from "@/modules/checkout/errors";
import { mpPreference } from "@/lib/mercadopago";
import { getCheckoutLines } from "@/modules/checkout/server-utils";

export const checkoutRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createMercadoPagoCheckoutInput)
    .mutation(async ({ ctx, input }) => {
      const lines = await getCheckoutLines(input.items);

      const customer = input.customer;
      const subtotalCents = lines.reduce(
        (total, line) => total + line.lineTotalCents,
        0,
      );
      const shippingCents = getCheckoutShippingCents(subtotalCents);
      const totalCents = subtotalCents + shippingCents;
      const shippingAddress = buildShippingAddress(customer);
      const userId = ctx.auth.user.id;

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
    }),
});
