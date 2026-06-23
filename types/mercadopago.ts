import { mpPayment } from "@/lib/mercadopago";

export type MercadoPagoPayment = Awaited<ReturnType<typeof mpPayment.get>>;

export type MercadoPagoWebhookPayload = Record<string, unknown> & {
  id?: string | number;
  type?: string;
  action?: string;
  data?: {
    id?: string | number;
  };
};
