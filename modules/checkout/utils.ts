import { env } from "@/lib/env";
import type { CreateMercadoPagoCheckoutInput } from "@/modules/checkout/validations";
import type {
  FulfillmentStatus,
  OrderStatus,
  PaymentStatus,
} from "@/modules/checkout/types";
import { MercadoPagoPayment } from "@/types/mercadopago";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export const getCheckoutAppUrl = () =>
  process.env.NODE_ENV === "production"
    ? env.NEXT_PUBLIC_APP_URL
    : (env.NGROK_URL ?? env.NEXT_PUBLIC_APP_URL);

export const centsToMercadoPagoAmount = (cents: number) =>
  Number((cents / 100).toFixed(2));

export const amountToCents = (amount: number | undefined) =>
  Math.round((amount ?? 0) * 100);

export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = Bun.randomUUIDv7().slice(-6).toUpperCase();

  return `CLA-${timestamp}-${suffix}`;
};

export const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const firstName = parts.shift() ?? name;
  const lastName = parts.join(" ");

  return {
    firstName,
    lastName,
  };
};

export const splitBrazilPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");

  if (digits.length <= 2) {
    return { number: digits };
  }

  return {
    area_code: digits.slice(0, 2),
    number: digits.slice(2),
  };
};

export const normalizeCheckoutItems = (
  items: CreateMercadoPagoCheckoutInput["items"],
) => {
  const quantitiesByVariantId = new Map<string, number>();

  for (const item of items) {
    quantitiesByVariantId.set(
      item.productVariantId,
      (quantitiesByVariantId.get(item.productVariantId) ?? 0) + item.quantity,
    );
  }

  return Array.from(quantitiesByVariantId, ([productVariantId, quantity]) => ({
    productVariantId,
    quantity,
  }));
};

export const getPaymentOrderId = (payment: {
  external_reference?: string | null;
  metadata?: unknown;
}) => {
  const metadata = payment.metadata as
    { order_id?: string; order_number?: string } | undefined;

  return payment.external_reference ?? metadata?.order_id ?? null;
};

export const getPaymentApprovedAt = (payment: {
  date_approved?: string | null;
}) => {
  if (!payment.date_approved) return new Date();

  const date = new Date(payment.date_approved);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

export const copyByStatus = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-green-500",
    title: "Pedido recebido",
    description:
      "O pagamento foi aprovado e o pedido foi recebido com sucesso. Você receberá um e-mail de confirmação em breve.",
  },
  pending: {
    icon: Clock,
    iconColor: "text-yellow-500",
    title: "Pagamento em análise",
    description:
      "O pedido foi criado e o pagamento ainda está pendente. A confirmação será sincronizada automaticamente pelo Mercado Pago.",
  },
  failure: {
    icon: AlertCircle,
    iconColor: "text-red-500",
    title: "Pagamento não concluído",
    description:
      "O Mercado Pago não confirmou esta tentativa. Você pode revisar a sacola e tentar novamente.",
  },
} as const;

type CheckoutReturnStatus = keyof typeof copyByStatus;

export const getReturnStatusFromPayment = (
  payment: MercadoPagoPayment | null,
): CheckoutReturnStatus => {
  if (!payment) return "failure";

  if (payment.status === "approved") return "success";

  if (payment.status === "rejected" || payment.status === "cancelled") {
    return "failure";
  }

  return "pending";
};

export const mapMercadoPagoPaymentStatus = (
  status: string | undefined,
  refundedAmount = 0,
  transactionAmount = 0,
): {
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  shouldDeductInventory: boolean;
  isTerminalFailure: boolean;
  isRefund: boolean;
} => {
  if (status === "approved") {
    if (refundedAmount > 0 && refundedAmount < transactionAmount) {
      return {
        orderStatus: "paid",
        paymentStatus: "partially_refunded",
        fulfillmentStatus: "processing",
        shouldDeductInventory: true,
        isTerminalFailure: false,
        isRefund: false,
      };
    }

    if (refundedAmount > 0 && refundedAmount >= transactionAmount) {
      return {
        orderStatus: "refunded",
        paymentStatus: "refunded",
        shouldDeductInventory: true,
        isTerminalFailure: false,
        isRefund: true,
      };
    }

    return {
      orderStatus: "paid",
      paymentStatus: "paid",
      fulfillmentStatus: "processing",
      shouldDeductInventory: true,
      isTerminalFailure: false,
      isRefund: false,
    };
  }

  if (status === "rejected" || status === "cancelled") {
    return {
      orderStatus: "canceled",
      paymentStatus: "failed",
      fulfillmentStatus: "canceled",
      shouldDeductInventory: false,
      isTerminalFailure: true,
      isRefund: false,
    };
  }

  if (status === "refunded" || status === "charged_back") {
    return {
      orderStatus: "refunded",
      paymentStatus: "refunded",
      shouldDeductInventory: false,
      isTerminalFailure: false,
      isRefund: true,
    };
  }

  return {
    orderStatus: "pending",
    paymentStatus: "pending",
    fulfillmentStatus: "unfulfilled",
    shouldDeductInventory: false,
    isTerminalFailure: false,
    isRefund: false,
  };
};
