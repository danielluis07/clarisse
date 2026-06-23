import type { NextRequest } from "next/server";
import {
  InvalidWebhookSignatureError,
  validateMercadoPagoWebhookSignature,
} from "@/lib/mercadopago";
import {
  CheckoutError,
  processMercadoPagoWebhook,
} from "@/modules/checkout/server-utils";
import { MercadoPagoWebhookPayload } from "@/types/mercadopago";

export const runtime = "nodejs";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readWebhookPayload = async (
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

const getSignatureDataIdCandidates = (
  request: NextRequest,
  payload: MercadoPagoWebhookPayload,
) => [
  request.nextUrl.searchParams.get("data.id"),
  request.nextUrl.searchParams.get("data_id"),
  request.nextUrl.searchParams.get("id"),
  getBodyDataId(payload),
  null,
];

const getResourceId = (
  request: NextRequest,
  payload: MercadoPagoWebhookPayload,
) => {
  const queryResourceId =
    getSignedDataId(request) ?? request.nextUrl.searchParams.get("id");

  if (queryResourceId) return queryResourceId;

  return getBodyDataId(payload);
};

const getTopic = (request: NextRequest, payload: MercadoPagoWebhookPayload) => {
  return (
    request.nextUrl.searchParams.get("type") ??
    request.nextUrl.searchParams.get("topic") ??
    payload.type ??
    ""
  );
};

export async function POST(request: NextRequest) {
  try {
    const payload = await readWebhookPayload(request);
    const resourceId = getResourceId(request, payload);
    const topic = getTopic(request, payload);
    const action = payload.action ?? null;
    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");

    validateMercadoPagoWebhookSignature({
      xSignature,
      xRequestId,
      dataIdCandidates: getSignatureDataIdCandidates(request, payload),
    });

    if (!resourceId || !xRequestId) {
      return Response.json(
        { message: "Webhook sem identificadores obrigatórios." },
        { status: 400 },
      );
    }

    console.log("Webhook validation successful, processing webhook");

    const result = await processMercadoPagoWebhook({
      payload,
      resourceId,
      topic,
      action,
      xRequestId,
    });

    return Response.json({
      received: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      console.warn("Invalid Mercado Pago webhook signature", {
        reason: error.reason,
        requestId: error.requestId,
        timestamp: error.timestamp,
      });

      return Response.json(
        { message: "Assinatura inválida." },
        { status: 401 },
      );
    }

    if (error instanceof CheckoutError) {
      return Response.json(
        {
          message: error.message,
        },
        { status: error.status },
      );
    }

    console.error("Mercado Pago webhook error", error);

    return Response.json(
      { message: "Erro ao processar webhook." },
      { status: 500 },
    );
  }
}
