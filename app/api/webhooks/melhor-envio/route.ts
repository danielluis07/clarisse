import type { NextRequest } from "next/server";
import { isValidMelhorEnvioSignature } from "@/lib/webhook-validation-utils";
import { processMelhorEnvioWebhook } from "@/modules/shipping/server-utils";
import { ShippingError } from "@/modules/shipping/errors";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-me-signature");

    if (!isValidMelhorEnvioSignature(rawBody, signature)) {
      console.warn("Invalid Melhor Envio webhook signature");
      return Response.json({ message: "Assinatura inválida." }, { status: 401 });
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return Response.json({ message: "Payload inválido." }, { status: 400 });
    }

    const event =
      typeof payload.event === "string" ? payload.event : "unknown";

    const result = await processMelhorEnvioWebhook({ event, payload });

    return Response.json({ received: true, ...result });
  } catch (error) {
    if (error instanceof ShippingError) {
      return Response.json({ message: error.message }, { status: error.status });
    }

    console.error("Melhor Envio webhook error", error);
    return Response.json(
      { message: "Erro ao processar webhook." },
      { status: 500 },
    );
  }
}
