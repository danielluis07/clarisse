import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { paymentWebhookEvents } from "@/db/schema";
import { CheckoutError, syncMercadoPagoPayment } from "@/modules/checkout/server-utils";

/**
 * Re-processes Mercado Pago payment webhooks that were recorded but never
 * successfully synced (e.g. an approved payment whose webhook threw before the
 * order was updated). `syncMercadoPagoPayment` is idempotent, so re-running it
 * is safe: orders already paid/deducted are left untouched.
 *
 * Run with: bun run db:reconcile:payments
 */
async function main() {
  const pending = await db
    .select({
      id: paymentWebhookEvents.id,
      resourceId: paymentWebhookEvents.resourceId,
      processingError: paymentWebhookEvents.processingError,
    })
    .from(paymentWebhookEvents)
    .where(
      and(
        eq(paymentWebhookEvents.provider, "mercadopago"),
        eq(paymentWebhookEvents.topic, "payment"),
        isNull(paymentWebhookEvents.processedAt),
      ),
    );

  if (pending.length === 0) {
    console.log("No unprocessed Mercado Pago payment webhooks to reconcile.");
    return;
  }

  console.log(`Found ${pending.length} unprocessed payment webhook(s).`);

  let succeeded = 0;
  let failed = 0;

  for (const event of pending) {
    try {
      const result = await syncMercadoPagoPayment(event.resourceId);

      await db
        .update(paymentWebhookEvents)
        .set({ processedAt: new Date(), processingError: null })
        .where(eq(paymentWebhookEvents.id, event.id));

      succeeded += 1;
      console.log("Reconciled payment", {
        paymentId: event.resourceId,
        orderNumber: result.orderNumber,
        orderStatus: result.orderStatus,
        paymentStatus: result.paymentStatus,
      });
    } catch (error) {
      failed += 1;
      const message =
        error instanceof CheckoutError || error instanceof Error
          ? error.message
          : "Erro desconhecido";

      await db
        .update(paymentWebhookEvents)
        .set({ processingError: message })
        .where(eq(paymentWebhookEvents.id, event.id));

      console.error("Failed to reconcile payment", {
        paymentId: event.resourceId,
        message,
      });
    }
  }

  console.log(`Reconciliation finished. Succeeded: ${succeeded}, failed: ${failed}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
