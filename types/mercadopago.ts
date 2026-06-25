import { mpPayment } from "@/lib/mercadopago";

export type MercadoPagoPayment = Awaited<ReturnType<typeof mpPayment.get>>;

export type MercadoPagoWebhookPayload = Record<string, unknown> & {
  id?: string | number;
  type?: string;
  action?: string;
  data?: {
    id?: string | number;
  };
  // Present on legacy IPN/topic notifications (e.g. merchant_order), which use
  // a different delivery mechanism and are not signed with the v2 manifest.
  resource?: string;
  topic?: string;
};
