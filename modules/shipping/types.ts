import type { CalculateShipmentService } from "@/lib/melhor-envio";

/** Connection status surfaced in the admin shipping settings page. */
export type ShippingIntegrationStatus = {
  connected: boolean;
  environment: string;
  accountName: string | null;
  connectedAt: Date | null;
  expiresAt: Date | null;
  /** True when there are tokens but the access token is already expired. */
  expired: boolean;
};

/**
 * Normalized quote option ready for the storefront. Prices are in cents to
 * match the rest of the app's money handling.
 */
export type ShippingQuoteOption = {
  serviceId: number;
  name: string;
  companyName: string;
  companyPicture: string | null;
  priceCents: number;
  deliveryTimeDays: number;
  deliveryRange: { min: number; max: number } | null;
};

/** A quote option that the carrier rejected (e.g. dimensions out of range). */
export type ShippingQuoteUnavailable = {
  serviceId: number;
  name: string;
  companyName: string;
  error: string;
};

export type FreeShippingInfo = {
  enabled: boolean;
  thresholdCents: number;
  applied: boolean;
  remainingCents: number;
};

export type ShippingQuoteResult = {
  options: ShippingQuoteOption[];
  unavailable: ShippingQuoteUnavailable[];
  freeShipping: FreeShippingInfo;
};

/** Resolved shipping for order creation (server-side re-quote). */
export type CheckoutShipping = {
  provider: "melhorenvio";
  serviceId: number;
  serviceName: string;
  companyName: string;
  shippingCents: number;
  freeShippingApplied: boolean;
};

export type RawShippingService = CalculateShipmentService;
