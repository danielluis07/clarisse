DROP INDEX "products_status_idx";--> statement-breakpoint
DROP INDEX "coupons_code_idx";--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_id_product_id_unique" UNIQUE("id","product_id");--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('portuguese', coalesce(name, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(description, ''))) STORED;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_variant_consistency_fk" FOREIGN KEY ("product_id","variant_id") REFERENCES "public"."product_variants"("product_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "customer_addresses_one_default_shipping_idx" ON "customer_addresses" USING btree ("customer_id") WHERE "customer_addresses"."is_default_shipping" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "customer_addresses_one_default_billing_idx" ON "customer_addresses" USING btree ("customer_id") WHERE "customer_addresses"."is_default_billing" = true;--> statement-breakpoint
CREATE INDEX "products_status_published_at_idx" ON "products" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "products_search_vector_idx" ON "products" USING gin ("search_vector");--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_code_idx" ON "coupons" USING btree (lower("code"));--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_compare_at_price_cents_gte_price" CHECK ("product_variants"."compare_at_price_cents" is null or "product_variants"."price_cents" is null or "product_variants"."compare_at_price_cents" >= "product_variants"."price_cents");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_compare_at_price_cents_gte_base" CHECK ("products"."compare_at_price_cents" is null or "products"."compare_at_price_cents" >= "products"."base_price_cents");