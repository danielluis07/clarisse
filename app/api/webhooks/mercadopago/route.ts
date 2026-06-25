import type { NextRequest } from "next/server";
import {
  CheckoutError,
  processMercadoPagoWebhook,
} from "@/modules/checkout/server-utils";
import {
  getResourceId,
  getSignatureDataIdCandidates,
  getTopic,
  InvalidWebhookSignatureError,
  isWebhookV2Notification,
  readWebhookPayload,
  validateMercadoPagoWebhookSignature,
} from "@/lib/webhook-validation-utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = await readWebhookPayload(request);

    if (!isWebhookV2Notification(payload)) {
      return Response.json({ received: true, skipped: "legacy_ipn" });
    }

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
