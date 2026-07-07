import { CheckoutError } from "@/modules/checkout/server/errors";
import { MercadoPagoWebhookPayload } from "@/types/mercadopago";
import type { NextRequest } from "next/server";
import {
  InvalidWebhookSignatureError,
  SignatureFailureReason,
  WebhookSignatureValidator,
} from "mercadopago";
import { env } from "@/lib/env";

const WEBHOOK_SIGNATURE_TOLERANCE_SECONDS = 300;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const readWebhookPayload = async (
  request: Request,
): Promise<MercadoPagoWebhookPayload> => {
  const payload: unknown = await request.json();

  if (!isRecord(payload)) {
    throw new CheckoutError("Payload inválido.", 400);
  }

  return payload as MercadoPagoWebhookPayload;
};

const getSignedDataId = (request: NextRequest) => {
  return (
    request.nextUrl.searchParams.get("data.id") ??
    request.nextUrl.searchParams.get("data_id")
  );
};

const getBodyDataId = (payload: MercadoPagoWebhookPayload) => {
  const bodyDataId = payload.data?.id;
  return bodyDataId === undefined || bodyDataId === null
    ? null
    : String(bodyDataId);
};

// Mercado Pago sends two notification systems to the same endpoint:
//   - Webhooks (v2): body has `data.id` + `type` + `action`, signed with the
//     `x-signature` manifest. These are the ones we validate and process.
//   - Legacy IPN/topic (e.g. merchant_order): body is `{ resource, topic }`,
//     delivered separately and NOT signed with the v2 manifest, so signature
//     validation always mismatches. We only ever act on the v2 payment webhook
//     (which carries the same payment id), so these are acknowledged and skipped.
export const isWebhookV2Notification = (payload: MercadoPagoWebhookPayload) =>
  getBodyDataId(payload) !== null;

export const getSignatureDataIdCandidates = (
  request: NextRequest,
  payload: MercadoPagoWebhookPayload,
) => [
  request.nextUrl.searchParams.get("data.id"),
  request.nextUrl.searchParams.get("data_id"),
  request.nextUrl.searchParams.get("id"),
  getBodyDataId(payload),
  null,
];

export const getResourceId = (
  request: NextRequest,
  payload: MercadoPagoWebhookPayload,
) => {
  const queryResourceId =
    getSignedDataId(request) ?? request.nextUrl.searchParams.get("id");

  if (queryResourceId) return queryResourceId;

  return getBodyDataId(payload);
};

export const getTopic = (
  request: NextRequest,
  payload: MercadoPagoWebhookPayload,
) => {
  return (
    request.nextUrl.searchParams.get("type") ??
    request.nextUrl.searchParams.get("topic") ??
    payload.type ??
    ""
  );
};

const getSignatureTimestamp = (xSignature: string | null) => {
  if (!xSignature) return null;

  for (const part of xSignature.split(",")) {
    const [key, value] = part.split("=");
    if (key?.trim().toLowerCase() === "ts" && value?.trim()) {
      return value.trim();
    }
  }

  return null;
};

const assertSignatureTimestampIsRecent = ({
  xSignature,
  xRequestId,
}: {
  xSignature: string | null;
  xRequestId: string | null;
}) => {
  const timestamp = getSignatureTimestamp(xSignature);
  if (!timestamp || !/^\d+$/.test(timestamp)) return;

  const rawTimestamp = Number(timestamp);
  const timestampMs =
    rawTimestamp < 10_000_000_000 ? rawTimestamp * 1000 : rawTimestamp;
  const driftSeconds = Math.abs(Date.now() - timestampMs) / 1000;

  if (driftSeconds > WEBHOOK_SIGNATURE_TOLERANCE_SECONDS) {
    throw new InvalidWebhookSignatureError(
      SignatureFailureReason.TimestampOutOfTolerance,
      xRequestId ?? undefined,
      timestamp,
    );
  }
};

export const validateMercadoPagoWebhookSignature = ({
  xSignature,
  xRequestId,
  dataId,
  dataIdCandidates,
}: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId?: string | null;
  dataIdCandidates?: Array<string | null | undefined>;
}) => {
  const candidates = [
    ...(dataIdCandidates ?? []),
    ...(dataIdCandidates ? [] : [dataId]),
  ];
  const normalizedCandidates = [
    ...new Set(candidates.map((candidate) => candidate ?? null)),
  ];
  const candidatesToTry = normalizedCandidates.length
    ? normalizedCandidates
    : [null];

  let signatureMismatch: InvalidWebhookSignatureError | null = null;

  for (const candidate of candidatesToTry) {
    try {
      WebhookSignatureValidator.validate({
        xSignature,
        xRequestId,
        dataId: candidate,
        secret: env.MP_WEBHOOK_SECRET,
      });

      assertSignatureTimestampIsRecent({ xSignature, xRequestId });
      return;
    } catch (error) {
      if (
        error instanceof InvalidWebhookSignatureError &&
        error.reason === SignatureFailureReason.SignatureMismatch
      ) {
        signatureMismatch = error;
        continue;
      }

      throw error;
    }
  }

  if (signatureMismatch) throw signatureMismatch;
};

export { InvalidWebhookSignatureError };
