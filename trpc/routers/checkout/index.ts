import { db } from "@/db";
import {
  cartItems,
  carts,
  customerAddresses,
  customers,
  orderItems,
  orders,
} from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { createMercadoPagoCheckoutInput } from "@/modules/checkout/validations";
import { resolveCheckoutShipping } from "@/modules/shipping/server-utils";
import { ShippingError } from "@/modules/shipping/errors";
import {
  centsToMercadoPagoAmount,
  generateOrderNumber,
  getCheckoutAppUrl,
  splitBrazilPhone,
  splitName,
} from "@/modules/checkout/utils";
import { CheckoutError } from "@/modules/checkout/errors";
import { mpPreference } from "@/lib/mercadopago";
import { getCheckoutLines } from "@/modules/checkout/server-utils";
import type { AddressSnapshot } from "@/types/db";

export const checkoutRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createMercadoPagoCheckoutInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;

      // The customer already exists at this point — it was created when the
      // user saved their first address — so we resolve it instead of inserting.
      const [customer] = await db
        .select({
          id: customers.id,
          name: customers.name,
          email: customers.email,
          phone: customers.phone,
        })
        .from(customers)
        .where(eq(customers.userId, userId))
        .limit(1);

      if (!customer) {
        throw new CheckoutError(
          "Cadastre um endereço de entrega antes de finalizar a compra.",
          422,
        );
      }

      // Load the chosen address scoped to the customer so a user can never
      // check out against someone else's address.
      const [address] = await db
        .select({
          recipientName: customerAddresses.recipientName,
          country: customerAddresses.country,
          postalCode: customerAddresses.postalCode,
          state: customerAddresses.state,
          city: customerAddresses.city,
          neighborhood: customerAddresses.neighborhood,
          addressLine1: customerAddresses.addressLine1,
          addressLine2: customerAddresses.addressLine2,
          number: customerAddresses.number,
        })
        .from(customerAddresses)
        .where(
          and(
            eq(customerAddresses.id, input.addressId),
            eq(customerAddresses.customerId, customer.id),
          ),
        )
        .limit(1);

      if (!address) {
        throw new CheckoutError("Endereço de entrega não encontrado.", 404);
      }

      const lines = await getCheckoutLines(input.items);

      const subtotalCents = lines.reduce(
        (total, line) => total + line.lineTotalCents,
        0,
      );

      // Re-quote the chosen carrier server-side — the client only tells us
      // which service it picked, never the price.
      let shipping;
      try {
        shipping = await resolveCheckoutShipping({
          postalCode: address.postalCode,
          items: input.items,
          shippingServiceId: input.shippingServiceId,
        });
      } catch (error) {
        if (error instanceof ShippingError) {
          throw new CheckoutError(error.message, error.status);
        }
        throw error;
      }

      const shippingCents = shipping.shippingCents;
      const totalCents = subtotalCents + shippingCents;

      const phone = customer.phone ?? null;
      const shippingAddress: AddressSnapshot = {
        recipientName: address.recipientName,
        phone,
        country: address.country,
        postalCode: address.postalCode,
        state: address.state,
        city: address.city,
        neighborhood: address.neighborhood,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        number: address.number,
      };

      const createdOrder = await db.transaction(async (tx) => {
        const [cart] = await tx
          .insert(carts)
          .values({
            userId,
            customerId: customer.id,
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
            customerId: customer.id,
            cartId: cart.id,
            status: "pending",
            paymentStatus: "pending",
            fulfillmentStatus: "unfulfilled",
            paymentProvider: "mercadopago",
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: phone,
            currency: "BRL",
            subtotalCents,
            discountCents: 0,
            shippingCents,
            taxCents: 0,
            totalCents,
            shippingAddress,
            shippingProvider: shipping.provider,
            shippingServiceId: shipping.serviceId,
            shippingServiceName: shipping.serviceName,
            shippingCompanyName: shipping.companyName,
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
            phone: splitBrazilPhone(phone ?? ""),
            address: {
              zip_code: address.postalCode,
              street_name: address.addressLine1,
              street_number: address.number ?? undefined,
            },
          },
          // Charge the shipping on top of the items so the amount paid matches
          // orders.totalCents (the webhook validates paid === total).
          shipments: {
            cost: centsToMercadoPagoAmount(shippingCents),
            mode: "not_specified",
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
