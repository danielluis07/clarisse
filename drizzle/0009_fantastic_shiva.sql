CREATE TABLE "melhor_envio_integration" (
	"id" text PRIMARY KEY DEFAULT 'melhor_envio' NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp with time zone,
	"scope" text,
	"environment" text DEFAULT 'sandbox' NOT NULL,
	"account_name" text,
	"connected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "melhor_envio_webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event" text NOT NULL,
	"provider_order_id" text,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone,
	"processing_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_provider" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_service_id" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_service_name" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_company_name" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "melhor_envio_order_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "melhor_envio_protocol" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tracking_code" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "label_url" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_status" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "height_cm" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "width_cm" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "length_cm" integer;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "origin_postal_code" text;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "sender_name" text;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "sender_document" text;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "sender_phone" text;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "sender_email" text;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "sender_address_line_1" text;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "sender_number" text;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "sender_complement" text;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "sender_neighborhood" text;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "sender_city" text;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "sender_state" text;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "default_package_height_cm" integer DEFAULT 4 NOT NULL;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "default_package_width_cm" integer DEFAULT 12 NOT NULL;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "default_package_length_cm" integer DEFAULT 17 NOT NULL;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "default_package_weight_grams" integer DEFAULT 300 NOT NULL;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "free_shipping_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "free_shipping_threshold_cents" integer DEFAULT 80000 NOT NULL;--> statement-breakpoint
CREATE INDEX "melhor_envio_webhook_events_order_idx" ON "melhor_envio_webhook_events" USING btree ("provider_order_id");--> statement-breakpoint
CREATE INDEX "melhor_envio_webhook_events_processed_at_idx" ON "melhor_envio_webhook_events" USING btree ("processed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_melhor_envio_order_id_idx" ON "orders" USING btree ("melhor_envio_order_id") WHERE "orders"."melhor_envio_order_id" is not null;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_height_cm_positive" CHECK ("products"."height_cm" is null or "products"."height_cm" > 0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_width_cm_positive" CHECK ("products"."width_cm" is null or "products"."width_cm" > 0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_length_cm_positive" CHECK ("products"."length_cm" is null or "products"."length_cm" > 0);