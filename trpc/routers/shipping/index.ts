import { TRPCError } from "@trpc/server";

import {
  adminProcedure,
  baseProcedure,
  createTRPCRouter,
} from "@/trpc/init";
import {
  calculateQuoteInput,
  updateShippingSettingsInput,
} from "@/modules/shipping/validations";
import {
  calculateQuote,
  disconnectMelhorEnvio,
  getIntegrationStatus,
  getStoreSettings,
  updateShippingSettings,
} from "@/modules/shipping/server-utils";
import { ShippingError } from "@/modules/shipping/errors";

const toTRPCError = (error: unknown): never => {
  if (error instanceof ShippingError) {
    throw new TRPCError({
      code:
        error.status === 409
          ? "CONFLICT"
          : error.status === 404
            ? "NOT_FOUND"
            : error.status >= 500
              ? "INTERNAL_SERVER_ERROR"
              : "BAD_REQUEST",
      message: error.message,
    });
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message:
      error instanceof Error ? error.message : "Erro na integração de envio.",
  });
};

/** Shape the store settings row down to the shipping-relevant fields. */
const pickShippingSettings = (
  settings: Awaited<ReturnType<typeof getStoreSettings>>,
) => ({
  originPostalCode: settings.originPostalCode,
  senderName: settings.senderName,
  senderDocument: settings.senderDocument,
  senderPhone: settings.senderPhone,
  senderEmail: settings.senderEmail,
  senderAddressLine1: settings.senderAddressLine1,
  senderNumber: settings.senderNumber,
  senderComplement: settings.senderComplement,
  senderNeighborhood: settings.senderNeighborhood,
  senderCity: settings.senderCity,
  senderState: settings.senderState,
  defaultPackageHeightCm: settings.defaultPackageHeightCm,
  defaultPackageWidthCm: settings.defaultPackageWidthCm,
  defaultPackageLengthCm: settings.defaultPackageLengthCm,
  defaultPackageWeightGrams: settings.defaultPackageWeightGrams,
  freeShippingEnabled: settings.freeShippingEnabled,
  freeShippingThresholdCents: settings.freeShippingThresholdCents,
});

export const shippingRouter = createTRPCRouter({
  getSettings: adminProcedure.query(async () => {
    try {
      const [settings, integration] = await Promise.all([
        getStoreSettings(),
        getIntegrationStatus(),
      ]);

      return {
        settings: pickShippingSettings(settings),
        integration,
      };
    } catch (error) {
      return toTRPCError(error);
    }
  }),

  updateSettings: adminProcedure
    .input(updateShippingSettingsInput)
    .mutation(async ({ input }) => {
      try {
        const settings = await updateShippingSettings(input);
        return pickShippingSettings(settings);
      } catch (error) {
        return toTRPCError(error);
      }
    }),

  getConnectionStatus: adminProcedure.query(async () => {
    try {
      return await getIntegrationStatus();
    } catch (error) {
      return toTRPCError(error);
    }
  }),

  disconnect: adminProcedure.mutation(async () => {
    try {
      await disconnectMelhorEnvio();
      return { disconnected: true };
    } catch (error) {
      return toTRPCError(error);
    }
  }),

  // Storefront freight quote — ready for Phase 2 checkout wiring. Public so
  // guests can quote shipping before authenticating.
  quote: baseProcedure.input(calculateQuoteInput).query(async ({ input }) => {
    try {
      return await calculateQuote(input);
    } catch (error) {
      return toTRPCError(error);
    }
  }),
});
