/** Single-row primary key for the `melhorEnvioIntegration` table. */
export const MELHOR_ENVIO_INTEGRATION_ID = "melhor_envio";

/** CSRF state cookie set before redirecting to the Melhor Envio OAuth screen. */
export const OAUTH_STATE_COOKIE = "me_oauth_state";

/**
 * Refresh the access token when it is within this window of expiring, so live
 * requests never race the expiry boundary.
 */
export const TOKEN_REFRESH_SKEW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fallback package used for shipping quotes when neither the product nor the
 * store settings provide dimensions. Centimeters / grams. Kept conservative to
 * avoid under-quoting. These match the defaults seeded on `storeSettings`.
 */
export const DEFAULT_PACKAGE = {
  heightCm: 4,
  widthCm: 12,
  lengthCm: 17,
  weightGrams: 300,
} as const;

/**
 * Melhor Envio enforces minimum package dimensions (Correios standard). Quotes
 * below these are clamped up to avoid `422` responses.
 */
export const MIN_PACKAGE = {
  heightCm: 1,
  widthCm: 11,
  lengthCm: 16,
  weightGrams: 1,
} as const;
