import "server-only";

import { env } from "@/lib/env";

/**
 * Low-level Melhor Envio API client.
 *
 * Mirrors the style of `lib/mercadopago.ts`: a thin, typed wrapper around the
 * HTTP API with no database access. Token storage/refresh lives in
 * `modules/shipping/server-utils.ts`; every authenticated method here receives
 * a valid `accessToken`.
 *
 * Docs: https://docs.melhorenvio.com.br/
 */

const BASE_URLS = {
  sandbox: "https://sandbox.melhorenvio.com.br",
  production: "https://www.melhorenvio.com.br",
} as const;

/**
 * OAuth scopes requested during authorization. Cover quoting, cart, purchase,
 * label generation/printing, tracking and cancellation.
 */
export const MELHOR_ENVIO_SCOPES = [
  "shipping-calculate",
  "shipping-cancel",
  "shipping-checkout",
  "shipping-companies",
  "shipping-generate",
  "shipping-preview",
  "shipping-print",
  "shipping-tracking",
  "ecommerce-shipping",
  "cart-read",
  "cart-write",
] as const;

export class MelhorEnvioError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 502, details?: unknown) {
    super(message);
    this.name = "MelhorEnvioError";
    this.status = status;
    this.details = details;
  }
}

export const getMelhorEnvioBaseUrl = () =>
  BASE_URLS[env.MELHOR_ENVIO_ENVIRONMENT];

export const getMelhorEnvioRedirectUri = () => {
  const baseUrl =
    process.env.NODE_ENV === "development" && env.NGROK_URL
      ? env.NGROK_URL
      : env.NEXT_PUBLIC_APP_URL;
  return `${baseUrl}/api/oauth/melhor-envio/callback`;
};

const getCredentials = () => {
  const clientId = env.MELHOR_ENVIO_CLIENT_ID;
  const clientSecret = env.MELHOR_ENVIO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new MelhorEnvioError(
      "Integração Melhor Envio não configurada. Defina MELHOR_ENVIO_CLIENT_ID e MELHOR_ENVIO_CLIENT_SECRET.",
      500,
    );
  }

  return { clientId, clientSecret };
};

/**
 * Melhor Envio requires a `User-Agent` identifying the application and a
 * contact email. Requests without it are rejected.
 */
const getUserAgent = () => {
  const appName = env.MELHOR_ENVIO_APP_NAME ?? "Clarisse";
  const email = env.MELHOR_ENVIO_CONTACT_EMAIL;

  return email ? `${appName} (${email})` : appName;
};

const parseJsonSafely = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

// ---------------------------------------------------------------------------
// OAuth
// ---------------------------------------------------------------------------

export type MelhorEnvioTokenResponse = {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
};

export const buildMelhorEnvioAuthorizeUrl = (state: string) => {
  const { clientId } = getCredentials();
  const url = new URL(`${getMelhorEnvioBaseUrl()}/oauth/authorize`);

  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", getMelhorEnvioRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  url.searchParams.set("scope", MELHOR_ENVIO_SCOPES.join(" "));

  return url.toString();
};

const requestToken = async (
  params: Record<string, string>,
): Promise<MelhorEnvioTokenResponse> => {
  const response = await fetch(`${getMelhorEnvioBaseUrl()}/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": getUserAgent(),
    },
    body: JSON.stringify(params),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new MelhorEnvioError(
      "Falha ao obter o token do Melhor Envio.",
      response.status,
      data,
    );
  }

  return data as MelhorEnvioTokenResponse;
};

export const exchangeMelhorEnvioCode = (code: string) => {
  const { clientId, clientSecret } = getCredentials();

  return requestToken({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: getMelhorEnvioRedirectUri(),
    code,
  });
};

export const refreshMelhorEnvioToken = (refreshToken: string) => {
  const { clientId, clientSecret } = getCredentials();

  return requestToken({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    scope: MELHOR_ENVIO_SCOPES.join(" "),
  });
};

// ---------------------------------------------------------------------------
// Authenticated requests
// ---------------------------------------------------------------------------

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  accessToken: string;
};

export const melhorEnvioRequest = async <T>(
  path: string,
  { method = "GET", body, accessToken }: RequestOptions,
): Promise<T> => {
  const response = await fetch(`${getMelhorEnvioBaseUrl()}/api/v2${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": getUserAgent(),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new MelhorEnvioError(
      `Erro na API do Melhor Envio (${response.status}).`,
      response.status,
      data,
    );
  }

  return data as T;
};

// ---------------------------------------------------------------------------
// API DTOs
// ---------------------------------------------------------------------------

export type MelhorEnvioAddress = {
  postal_code: string;
};

export type MelhorEnvioProductInput = {
  /** Local reference (e.g. variant id), echoed back by the API. */
  id: string;
  width: number;
  height: number;
  length: number;
  /** Weight in kilograms. */
  weight: number;
  insurance_value: number;
  quantity: number;
};

export type CalculateShipmentRequest = {
  from: MelhorEnvioAddress;
  to: MelhorEnvioAddress;
  products: MelhorEnvioProductInput[];
  options?: {
    receipt?: boolean;
    own_hand?: boolean;
    insurance_value?: number;
    use_insurance_value?: boolean;
  };
  services?: string;
};

export type CalculateShipmentService = {
  id: number;
  name: string;
  price: string;
  custom_price: string;
  discount: string;
  currency: string;
  delivery_time: number;
  delivery_range?: { min: number; max: number };
  custom_delivery_time?: number;
  custom_delivery_range?: { min: number; max: number };
  company: {
    id: number;
    name: string;
    picture: string;
  };
  /** Present when the service cannot be used for this quote. */
  error?: string;
};

export type MelhorEnvioAccount = {
  id: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  company?: { name?: string } | null;
};

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

/** Freight quotation. Returns one entry per carrier service. */
export const calculateShipment = (
  accessToken: string,
  payload: CalculateShipmentRequest,
) =>
  melhorEnvioRequest<CalculateShipmentService[]>("/me/shipment/calculate", {
    method: "POST",
    body: payload,
    accessToken,
  });

/** Authenticated account info — useful to display the connected account. */
export const getMelhorEnvioAccount = (accessToken: string) =>
  melhorEnvioRequest<MelhorEnvioAccount>("/me", { accessToken });

/**
 * The methods below complete the fulfillment workflow. They are intentionally
 * left ready for Phase 2 (admin label generation), where the request shapes
 * will be tightened with dedicated DTOs.
 */

export const addCartItem = (accessToken: string, payload: unknown) =>
  melhorEnvioRequest<unknown>("/me/cart", {
    method: "POST",
    body: payload,
    accessToken,
  });

export const checkoutCart = (accessToken: string, orders: string[]) =>
  melhorEnvioRequest<unknown>("/me/shipment/checkout", {
    method: "POST",
    body: { orders },
    accessToken,
  });

export const generateLabels = (accessToken: string, orders: string[]) =>
  melhorEnvioRequest<unknown>("/me/shipment/generate", {
    method: "POST",
    body: { orders },
    accessToken,
  });

export const printLabels = (
  accessToken: string,
  orders: string[],
  mode: "private" | "public" = "private",
) =>
  melhorEnvioRequest<{ url: string }>("/me/shipment/print", {
    method: "POST",
    body: { mode, orders },
    accessToken,
  });

export const getTracking = (accessToken: string, orders: string[]) =>
  melhorEnvioRequest<Record<string, unknown>>("/me/shipment/tracking", {
    method: "POST",
    body: { orders },
    accessToken,
  });

export const cancelShipment = (accessToken: string, payload: unknown) =>
  melhorEnvioRequest<unknown>("/me/shipment/cancel", {
    method: "POST",
    body: payload,
    accessToken,
  });
