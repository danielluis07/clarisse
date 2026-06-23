import type {
  FulfillmentStatus,
  OrderStatus,
  PaymentStatus,
} from "@/modules/checkout/types";

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
