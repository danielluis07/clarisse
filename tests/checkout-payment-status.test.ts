import { describe, expect, test } from "bun:test";
import { mapMercadoPagoPaymentStatus } from "@/modules/checkout/utils";

describe("Mercado Pago payment status mapping", () => {
  test("maps approved payments to paid orders and inventory deduction", () => {
    expect(mapMercadoPagoPaymentStatus("approved")).toMatchObject({
      orderStatus: "paid",
      paymentStatus: "paid",
      fulfillmentStatus: "processing",
      shouldDeductInventory: true,
    });
  });

  test("maps rejected payments to canceled failed orders", () => {
    expect(mapMercadoPagoPaymentStatus("rejected")).toMatchObject({
      orderStatus: "canceled",
      paymentStatus: "failed",
      fulfillmentStatus: "canceled",
      shouldDeductInventory: false,
      isTerminalFailure: true,
    });
  });

  test("maps fully refunded approved payments to refunded orders", () => {
    expect(mapMercadoPagoPaymentStatus("approved", 12000, 12000)).toMatchObject(
      {
        orderStatus: "refunded",
        paymentStatus: "refunded",
        shouldDeductInventory: true,
        isRefund: true,
      },
    );
  });
});
