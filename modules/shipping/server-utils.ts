import "server-only";

import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  melhorEnvioIntegration,
  melhorEnvioWebhookEvents,
  orders,
  products,
  productVariants,
  storeSettings,
} from "@/db/schema";
import { env } from "@/lib/env";
import {
  calculateShipment,
  exchangeMelhorEnvioCode,
  getMelhorEnvioAccount,
  MELHOR_ENVIO_SCOPES,
  refreshMelhorEnvioToken,
  type CalculateShipmentRequest,
  type CalculateShipmentService,
  type MelhorEnvioTokenResponse,
} from "@/lib/melhor-envio";
import {
  DEFAULT_PACKAGE,
  MELHOR_ENVIO_INTEGRATION_ID,
  MIN_PACKAGE,
  TOKEN_REFRESH_SKEW_MS,
} from "@/modules/shipping/constants";
import { ShippingError } from "@/modules/shipping/errors";
import type { CalculateQuoteInput } from "@/modules/shipping/validations";
import type {
  ShippingIntegrationStatus,
  ShippingQuoteResult,
} from "@/modules/shipping/types";

const STORE_SETTINGS_ID = "store_settings";

// ---------------------------------------------------------------------------
// Store settings (shipping section)
// ---------------------------------------------------------------------------

export const getStoreSettings = async () => {
  const [existing] = await db
    .select()
    .from(storeSettings)
    .where(eq(storeSettings.id, STORE_SETTINGS_ID))
    .limit(1);

  if (existing) return existing;

  // First access — create the single settings row with column defaults.
  const [created] = await db
    .insert(storeSettings)
    .values({ id: STORE_SETTINGS_ID })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  const [row] = await db
    .select()
    .from(storeSettings)
    .where(eq(storeSettings.id, STORE_SETTINGS_ID))
    .limit(1);

  if (!row) {
    throw new ShippingError(
      "Não foi possível carregar as configurações da loja.",
      500,
    );
  }

  return row;
};

type StoreSettingsRow = Awaited<ReturnType<typeof getStoreSettings>>;

export const updateShippingSettings = async (
  values: Partial<typeof storeSettings.$inferInsert>,
) => {
  await getStoreSettings();

  await db
    .update(storeSettings)
    .set(values)
    .where(eq(storeSettings.id, STORE_SETTINGS_ID));

  return getStoreSettings();
};

/**
 * Resolve whether an order qualifies for free shipping under the configurable
 * store rule. Phase 2 checkout uses this to decide if the customer pays the
 * quoted price or zero. Exported now so the rule lives in one place.
 */
export const resolveFreeShipping = (
  settings: Pick<
    StoreSettingsRow,
    "freeShippingEnabled" | "freeShippingThresholdCents"
  >,
  subtotalCents: number,
) =>
  settings.freeShippingEnabled &&
  subtotalCents >= settings.freeShippingThresholdCents;

// ---------------------------------------------------------------------------
// OAuth token persistence / refresh
// ---------------------------------------------------------------------------

const getIntegrationRow = async () => {
  const [row] = await db
    .select()
    .from(melhorEnvioIntegration)
    .where(eq(melhorEnvioIntegration.id, MELHOR_ENVIO_INTEGRATION_ID))
    .limit(1);

  return row ?? null;
};

const upsertIntegration = async (
  values: Partial<typeof melhorEnvioIntegration.$inferInsert>,
) => {
  await db
    .insert(melhorEnvioIntegration)
    .values({ id: MELHOR_ENVIO_INTEGRATION_ID, ...values })
    .onConflictDoUpdate({
      target: melhorEnvioIntegration.id,
      set: { ...values, updatedAt: new Date() },
    });
};

const persistTokens = async (
  token: MelhorEnvioTokenResponse,
  extra: { scope?: string; accountName?: string | null } = {},
) => {
  await upsertIntegration({
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: new Date(Date.now() + token.expires_in * 1000),
    environment: env.MELHOR_ENVIO_ENVIRONMENT,
    connectedAt: new Date(),
    ...(extra.scope !== undefined ? { scope: extra.scope } : {}),
    ...(extra.accountName !== undefined
      ? { accountName: extra.accountName }
      : {}),
  });
};

/**
 * Complete the OAuth flow: exchange the authorization code for tokens, fetch
 * the connected account name for display, and persist everything.
 */
export const connectMelhorEnvio = async (code: string) => {
  const token = await exchangeMelhorEnvioCode(code);

  let accountName: string | null = null;
  try {
    const account = await getMelhorEnvioAccount(token.access_token);
    const fullName = [account.firstname, account.lastname]
      .filter(Boolean)
      .join(" ");
    accountName =
      account.company?.name || fullName || account.email || null;
  } catch {
    // Account lookup is best-effort; the connection is still valid.
  }

  await persistTokens(token, {
    // The token response does not echo scopes; record what we requested.
    scope: MELHOR_ENVIO_SCOPES.join(" "),
    accountName,
  });
};

/**
 * Return a valid access token, transparently refreshing it when close to
 * expiry. Throws a `ShippingError` when the integration is not connected.
 */
export const getValidAccessToken = async (): Promise<string> => {
  const row = await getIntegrationRow();

  if (!row?.accessToken || !row.refreshToken) {
    throw new ShippingError(
      "Melhor Envio não está conectado. Conecte a conta nas configurações de envio.",
      409,
    );
  }

  const expiresSoon =
    !row.expiresAt ||
    row.expiresAt.getTime() - Date.now() <= TOKEN_REFRESH_SKEW_MS;

  if (!expiresSoon) return row.accessToken;

  try {
    const refreshed = await refreshMelhorEnvioToken(row.refreshToken);
    await persistTokens(refreshed);
    return refreshed.access_token;
  } catch {
    throw new ShippingError(
      "Não foi possível renovar o acesso ao Melhor Envio. Reconecte a conta.",
      409,
    );
  }
};

export const getIntegrationStatus =
  async (): Promise<ShippingIntegrationStatus> => {
    const row = await getIntegrationRow();
    const connected = Boolean(row?.accessToken && row?.refreshToken);

    return {
      connected,
      environment: row?.environment ?? env.MELHOR_ENVIO_ENVIRONMENT,
      accountName: row?.accountName ?? null,
      connectedAt: row?.connectedAt ?? null,
      expiresAt: row?.expiresAt ?? null,
      expired: connected
        ? Boolean(row?.expiresAt && row.expiresAt.getTime() <= Date.now())
        : false,
    };
  };

export const disconnectMelhorEnvio = async () => {
  await upsertIntegration({
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    scope: null,
    accountName: null,
    connectedAt: null,
  });
};

// ---------------------------------------------------------------------------
// Quotation
// ---------------------------------------------------------------------------

const clampPackage = (value: number, min: number) => Math.max(value, min);

/**
 * Build the `from/to/products` payload for `/me/shipment/calculate`. Each cart
 * line becomes one product entry using the product dimensions (falling back to
 * the store default package), the variant weight and the price as insurance
 * value.
 */
const buildQuotePayload = (
  toPostalCode: string,
  settings: StoreSettingsRow,
  lines: Array<{
    productVariantId: string;
    quantity: number;
    heightCm: number | null;
    widthCm: number | null;
    lengthCm: number | null;
    weightGrams: number | null;
    unitPriceCents: number;
  }>,
): CalculateShipmentRequest => {
  if (!settings.originPostalCode) {
    throw new ShippingError(
      "Defina o CEP de origem nas configurações de envio antes de cotar o frete.",
      409,
    );
  }

  const fallbackHeight =
    settings.defaultPackageHeightCm ?? DEFAULT_PACKAGE.heightCm;
  const fallbackWidth =
    settings.defaultPackageWidthCm ?? DEFAULT_PACKAGE.widthCm;
  const fallbackLength =
    settings.defaultPackageLengthCm ?? DEFAULT_PACKAGE.lengthCm;
  const fallbackWeight =
    settings.defaultPackageWeightGrams ?? DEFAULT_PACKAGE.weightGrams;

  return {
    from: { postal_code: settings.originPostalCode },
    to: { postal_code: toPostalCode },
    products: lines.map((line) => ({
      id: line.productVariantId,
      height: clampPackage(
        line.heightCm ?? fallbackHeight,
        MIN_PACKAGE.heightCm,
      ),
      width: clampPackage(line.widthCm ?? fallbackWidth, MIN_PACKAGE.widthCm),
      length: clampPackage(
        line.lengthCm ?? fallbackLength,
        MIN_PACKAGE.lengthCm,
      ),
      weight:
        clampPackage(
          line.weightGrams ?? fallbackWeight,
          MIN_PACKAGE.weightGrams,
        ) / 1000,
      insurance_value: line.unitPriceCents / 100,
      quantity: line.quantity,
    })),
  };
};

const toCents = (value: string) => Math.round(Number(value) * 100);

const normalizeQuoteResult = (
  services: CalculateShipmentService[],
): ShippingQuoteResult => {
  const options: ShippingQuoteResult["options"] = [];
  const unavailable: ShippingQuoteResult["unavailable"] = [];

  for (const service of services) {
    if (service.error || !service.price) {
      unavailable.push({
        serviceId: service.id,
        name: service.name,
        companyName: service.company?.name ?? "",
        error: service.error ?? "Serviço indisponível.",
      });
      continue;
    }

    const range = service.custom_delivery_range ?? service.delivery_range;

    options.push({
      serviceId: service.id,
      name: service.name,
      companyName: service.company?.name ?? "",
      companyPicture: service.company?.picture ?? null,
      priceCents: toCents(service.custom_price || service.price),
      deliveryTimeDays: service.custom_delivery_time ?? service.delivery_time,
      deliveryRange: range ? { min: range.min, max: range.max } : null,
    });
  }

  options.sort((a, b) => a.priceCents - b.priceCents);

  return { options, unavailable };
};

/**
 * Resolve cart items to shippable lines and request a freight quote.
 * Ready for Phase 2 storefront/checkout wiring.
 */
export const calculateQuote = async (
  input: CalculateQuoteInput,
): Promise<ShippingQuoteResult> => {
  const settings = await getStoreSettings();
  const variantIds = input.items.map((item) => item.productVariantId);

  const rows = await db
    .select({
      productVariantId: productVariants.id,
      weightGrams: productVariants.weightGrams,
      priceCents: productVariants.priceCents,
      basePriceCents: products.basePriceCents,
      heightCm: products.heightCm,
      widthCm: products.widthCm,
      lengthCm: products.lengthCm,
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

  const lines = input.items.map((item) => {
    const row = rowsByVariantId.get(item.productVariantId);

    if (!row) {
      throw new ShippingError(
        "Um dos itens não está mais disponível para cálculo de frete.",
        409,
      );
    }

    return {
      productVariantId: row.productVariantId,
      quantity: item.quantity,
      heightCm: row.heightCm,
      widthCm: row.widthCm,
      lengthCm: row.lengthCm,
      weightGrams: row.weightGrams,
      unitPriceCents: row.priceCents ?? row.basePriceCents,
    };
  });

  const payload = buildQuotePayload(input.toPostalCode, settings, lines);
  const accessToken = await getValidAccessToken();
  const services = await calculateShipment(accessToken, payload);

  return normalizeQuoteResult(services);
};

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

const STATUS_TO_FULFILLMENT: Record<
  string,
  (typeof orders.$inferSelect)["fulfillmentStatus"] | undefined
> = {
  "order.posted": "shipped",
  "order.delivered": "delivered",
};

/**
 * Persist an inbound webhook event idempotently and, when it references an
 * order we know about, update its tracking/fulfillment data.
 */
export const processMelhorEnvioWebhook = async ({
  event,
  payload,
}: {
  event: string;
  payload: Record<string, unknown>;
}) => {
  const data = (payload.data ?? {}) as Record<string, unknown>;
  const providerOrderId =
    typeof data.id === "string"
      ? data.id
      : typeof payload.id === "string"
        ? payload.id
        : null;

  const [stored] = await db
    .insert(melhorEnvioWebhookEvents)
    .values({
      event,
      providerOrderId,
      payload,
    })
    .returning({ id: melhorEnvioWebhookEvents.id });

  if (!stored) {
    throw new ShippingError("Não foi possível registrar o webhook.", 500);
  }

  if (!providerOrderId) {
    await db
      .update(melhorEnvioWebhookEvents)
      .set({ processedAt: new Date() })
      .where(eq(melhorEnvioWebhookEvents.id, stored.id));
    return { processed: false, reason: "no_order_reference" as const };
  }

  try {
    const trackingCode =
      typeof data.tracking === "string" ? data.tracking : undefined;
    const fulfillmentStatus = STATUS_TO_FULFILLMENT[event];
    const shippingStatus = event.replace(/^order\./, "");

    await db
      .update(orders)
      .set({
        shippingStatus,
        ...(trackingCode ? { trackingCode } : {}),
        ...(fulfillmentStatus ? { fulfillmentStatus } : {}),
        ...(event === "order.posted" ? { fulfilledAt: new Date() } : {}),
      })
      .where(eq(orders.melhorEnvioOrderId, providerOrderId));

    await db
      .update(melhorEnvioWebhookEvents)
      .set({ processedAt: new Date(), processingError: null })
      .where(eq(melhorEnvioWebhookEvents.id, stored.id));

    return { processed: true };
  } catch (error) {
    await db
      .update(melhorEnvioWebhookEvents)
      .set({
        processingError:
          error instanceof Error ? error.message : "Erro desconhecido",
      })
      .where(eq(melhorEnvioWebhookEvents.id, stored.id));
    throw error;
  }
};
