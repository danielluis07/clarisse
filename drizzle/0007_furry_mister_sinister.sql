CREATE TABLE "payment_webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text DEFAULT 'mercadopago' NOT NULL,
	"provider_event_id" text,
	"resource_id" text NOT NULL,
	"topic" text NOT NULL,
	"action" text,
	"x_request_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone,
	"processing_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_provider" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "mercado_pago_preference_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "mercado_pago_payment_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "mercado_pago_payment_status" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "mercado_pago_payment_status_detail" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "mercado_pago_payment_type" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "mercado_pago_payment_method_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "mercado_pago_merchant_order_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "mercado_pago_live_mode" boolean;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "inventory_deducted_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "payment_webhook_events_provider_request_idx" ON "payment_webhook_events" USING btree ("provider","x_request_id");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_provider_resource_idx" ON "payment_webhook_events" USING btree ("provider","resource_id");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_processed_at_idx" ON "payment_webhook_events" USING btree ("processed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_mercado_pago_preference_id_idx" ON "orders" USING btree ("mercado_pago_preference_id") WHERE "orders"."mercado_pago_preference_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "orders_mercado_pago_payment_id_idx" ON "orders" USING btree ("mercado_pago_payment_id") WHERE "orders"."mercado_pago_payment_id" is not null;--> statement-breakpoint
CREATE INDEX "orders_payment_provider_idx" ON "orders" USING btree ("payment_provider");