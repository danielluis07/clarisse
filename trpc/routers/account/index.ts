import { db } from "@/db";
import { customerAddresses, customers } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, ne } from "drizzle-orm";
import {
  createAddressInput,
  deleteAddressInput,
  updateAddressInput,
  updateProfileInput,
  type AccountAddressOutput,
} from "@/modules/account/validations";

/**
 * Resolve the customer row linked to the given auth user.
 *
 * Every user gets a `customers` row at registration (see the Better Auth
 * `user.create` hook), so this only returns `null` for inconsistent data.
 */
const getCustomerForUser = async (userId: string) => {
  const [customer] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.userId, userId))
    .limit(1);

  return customer ?? null;
};

const addressSelect = {
  id: customerAddresses.id,
  label: customerAddresses.label,
  recipient: customerAddresses.recipientName,
  line1: customerAddresses.addressLine1,
  line2: customerAddresses.addressLine2,
  number: customerAddresses.number,
  neighborhood: customerAddresses.neighborhood,
  city: customerAddresses.city,
  state: customerAddresses.state,
  postalCode: customerAddresses.postalCode,
  isDefault: customerAddresses.isDefaultShipping,
  createdAt: customerAddresses.createdAt,
  updatedAt: customerAddresses.updatedAt,
};

/** Map the validated address payload onto the `customer_addresses` columns. */
const toAddressValues = (input: AccountAddressOutput) => ({
  label: input.label,
  recipientName: input.recipient,
  addressLine1: input.addressLine1,
  addressLine2: input.complement,
  number: input.number,
  neighborhood: input.neighborhood,
  city: input.city,
  state: input.state,
  postalCode: input.postalCode,
});

export const accountRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const [customer] = await db
      .select({ phone: customers.phone })
      .from(customers)
      .where(eq(customers.userId, ctx.auth.user.id))
      .limit(1);

    return { phone: customer?.phone ?? null };
  }),

  updateProfile: protectedProcedure
    .input(updateProfileInput)
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(customers)
        .set({ phone: input.phone, updatedAt: new Date() })
        .where(eq(customers.userId, ctx.auth.user.id))
        .returning({ phone: customers.phone });

      if (!updated) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Não foi possível resolver o cliente do usuário.",
        });
      }

      return { phone: updated.phone };
    }),

  listAddresses: protectedProcedure.query(async ({ ctx }) => {
    const customer = await getCustomerForUser(ctx.auth.user.id);

    if (!customer) {
      return [];
    }

    return db
      .select(addressSelect)
      .from(customerAddresses)
      .where(eq(customerAddresses.customerId, customer.id))
      .orderBy(
        desc(customerAddresses.isDefaultShipping),
        desc(customerAddresses.createdAt),
        desc(customerAddresses.id),
      );
  }),

  createAddress: protectedProcedure
    .input(createAddressInput)
    .mutation(async ({ ctx, input }) => {
      const customer = await getCustomerForUser(ctx.auth.user.id);

      if (!customer) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Não foi possível resolver o cliente do usuário.",
        });
      }

      return db.transaction(async (tx) => {
        const [existing] = await tx
          .select({ value: count() })
          .from(customerAddresses)
          .where(eq(customerAddresses.customerId, customer.id));

        // The first address a customer saves becomes the default automatically.
        const shouldBeDefault = input.isDefault || (existing?.value ?? 0) === 0;

        // The DB enforces a single default shipping address per customer, so
        // clear the previous default before inserting the new one.
        if (shouldBeDefault) {
          await tx
            .update(customerAddresses)
            .set({ isDefaultShipping: false })
            .where(
              and(
                eq(customerAddresses.customerId, customer.id),
                eq(customerAddresses.isDefaultShipping, true),
              ),
            );
        }

        const [address] = await tx
          .insert(customerAddresses)
          .values({
            customerId: customer.id,
            ...toAddressValues(input),
            isDefaultShipping: shouldBeDefault,
          })
          .returning(addressSelect);

        if (!address) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Não foi possível salvar o endereço.",
          });
        }

        return address;
      });
    }),

  updateAddress: protectedProcedure
    .input(updateAddressInput)
    .mutation(async ({ ctx, input }) => {
      const customer = await getCustomerForUser(ctx.auth.user.id);

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Endereço não encontrado.",
        });
      }

      return db.transaction(async (tx) => {
        const [existing] = await tx
          .select({ id: customerAddresses.id })
          .from(customerAddresses)
          .where(
            and(
              eq(customerAddresses.id, input.id),
              eq(customerAddresses.customerId, customer.id),
            ),
          )
          .limit(1);

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Endereço não encontrado.",
          });
        }

        // Clear any other default before promoting this one.
        if (input.isDefault) {
          await tx
            .update(customerAddresses)
            .set({ isDefaultShipping: false })
            .where(
              and(
                eq(customerAddresses.customerId, customer.id),
                eq(customerAddresses.isDefaultShipping, true),
                ne(customerAddresses.id, input.id),
              ),
            );
        }

        const [address] = await tx
          .update(customerAddresses)
          .set({
            ...toAddressValues(input),
            isDefaultShipping: input.isDefault,
          })
          .where(
            and(
              eq(customerAddresses.id, input.id),
              eq(customerAddresses.customerId, customer.id),
            ),
          )
          .returning(addressSelect);

        if (!address) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Endereço não encontrado.",
          });
        }

        return address;
      });
    }),

  deleteAddress: protectedProcedure
    .input(deleteAddressInput)
    .mutation(async ({ ctx, input }) => {
      const customer = await getCustomerForUser(ctx.auth.user.id);

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Endereço não encontrado.",
        });
      }

      return db.transaction(async (tx) => {
        const [deleted] = await tx
          .delete(customerAddresses)
          .where(
            and(
              eq(customerAddresses.id, input.id),
              eq(customerAddresses.customerId, customer.id),
            ),
          )
          .returning(addressSelect);

        if (!deleted) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Endereço não encontrado.",
          });
        }

        // Promote the most recent remaining address so the customer is never
        // left without a default shipping address.
        if (deleted.isDefault) {
          const [next] = await tx
            .select({ id: customerAddresses.id })
            .from(customerAddresses)
            .where(eq(customerAddresses.customerId, customer.id))
            .orderBy(desc(customerAddresses.createdAt))
            .limit(1);

          if (next) {
            await tx
              .update(customerAddresses)
              .set({ isDefaultShipping: true })
              .where(eq(customerAddresses.id, next.id));
          }
        }

        return deleted;
      });
    }),
});
