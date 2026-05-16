CREATE TYPE "public"."banner_placement" AS ENUM('home_hero', 'home_featured', 'collection_page', 'category_page', 'product_page', 'promotional', 'editorial');--> statement-breakpoint
CREATE TYPE "public"."cart_status" AS ENUM('active', 'converted', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed_amount', 'free_shipping');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_status" AS ENUM('unfulfilled', 'processing', 'shipped', 'delivered', 'canceled', 'returned');--> statement-breakpoint
CREATE TYPE "public"."inventory_movement_type" AS ENUM('adjustment', 'restock', 'sale', 'return', 'correction');--> statement-breakpoint
CREATE TYPE "public"."media_asset_type" AS ENUM('image', 'video', 'document');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'canceled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TABLE "banners" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"image_id" text,
	"mobile_image_id" text,
	"cta_label" text,
	"cta_url" text,
	"placement" "banner_placement" NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "banners_display_order_non_negative" CHECK ("banners"."display_order" >= 0),
	CONSTRAINT "banners_date_range_valid" CHECK ("banners"."starts_at" is null or "banners"."ends_at" is null or "banners"."ends_at" >= "banners"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" text PRIMARY KEY NOT NULL,
	"cart_id" text NOT NULL,
	"product_variant_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"line_total_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_items_cart_variant_unique" UNIQUE("cart_id","product_variant_id"),
	CONSTRAINT "cart_items_quantity_positive" CHECK ("cart_items"."quantity" > 0),
	CONSTRAINT "cart_items_unit_price_cents_non_negative" CHECK ("cart_items"."unit_price_cents" >= 0),
	CONSTRAINT "cart_items_line_total_cents_non_negative" CHECK ("cart_items"."line_total_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"customer_id" text,
	"coupon_id" text,
	"status" "cart_status" DEFAULT 'active' NOT NULL,
	"email" text,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"subtotal_cents" integer DEFAULT 0 NOT NULL,
	"discount_cents" integer DEFAULT 0 NOT NULL,
	"shipping_cents" integer DEFAULT 0 NOT NULL,
	"total_cents" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "carts_subtotal_cents_non_negative" CHECK ("carts"."subtotal_cents" >= 0),
	CONSTRAINT "carts_discount_cents_non_negative" CHECK ("carts"."discount_cents" >= 0),
	CONSTRAINT "carts_shipping_cents_non_negative" CHECK ("carts"."shipping_cents" >= 0),
	CONSTRAINT "carts_total_cents_non_negative" CHECK ("carts"."total_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_display_order_non_negative" CHECK ("categories"."display_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collections_display_order_non_negative" CHECK ("collections"."display_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" text PRIMARY KEY NOT NULL,
	"coupon_id" text NOT NULL,
	"customer_id" text,
	"order_id" text NOT NULL,
	"redeemed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" "discount_type" NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"minimum_subtotal_cents" integer DEFAULT 0 NOT NULL,
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_value_matches_discount_type" CHECK ((
        ("coupons"."discount_type" = 'percentage' and "coupons"."value" between 1 and 100)
        or ("coupons"."discount_type" = 'fixed_amount' and "coupons"."value" > 0)
        or ("coupons"."discount_type" = 'free_shipping' and "coupons"."value" = 0)
      )),
	CONSTRAINT "coupons_minimum_subtotal_cents_non_negative" CHECK ("coupons"."minimum_subtotal_cents" >= 0),
	CONSTRAINT "coupons_usage_limit_non_negative" CHECK ("coupons"."usage_limit" is null or "coupons"."usage_limit" >= 0),
	CONSTRAINT "coupons_usage_count_non_negative" CHECK ("coupons"."usage_count" >= 0),
	CONSTRAINT "coupons_usage_count_within_limit" CHECK ("coupons"."usage_limit" is null or "coupons"."usage_count" <= "coupons"."usage_limit"),
	CONSTRAINT "coupons_date_range_valid" CHECK ("coupons"."starts_at" is null or "coupons"."expires_at" is null or "coupons"."expires_at" >= "coupons"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "customer_addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"label" text,
	"recipient_name" text NOT NULL,
	"phone" text,
	"country" text DEFAULT 'BR' NOT NULL,
	"postal_code" text NOT NULL,
	"state" text NOT NULL,
	"city" text NOT NULL,
	"neighborhood" text,
	"address_line_1" text NOT NULL,
	"address_line_2" text,
	"number" text,
	"is_default_shipping" boolean DEFAULT false NOT NULL,
	"is_default_billing" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"accepts_marketing" boolean DEFAULT false NOT NULL,
	"orders_count" integer DEFAULT 0 NOT NULL,
	"total_spent_cents" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_orders_count_non_negative" CHECK ("customers"."orders_count" >= 0),
	CONSTRAINT "customers_total_spent_cents_non_negative" CHECK ("customers"."total_spent_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" text PRIMARY KEY NOT NULL,
	"product_variant_id" text NOT NULL,
	"order_item_id" text,
	"type" "inventory_movement_type" NOT NULL,
	"quantity_delta" integer NOT NULL,
	"reason" text,
	"reference_type" text,
	"reference_id" text,
	"created_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_movements_quantity_delta_non_zero" CHECK ("inventory_movements"."quantity_delta" <> 0)
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"url" text NOT NULL,
	"bucket" text,
	"filename" text NOT NULL,
	"alt_text" text,
	"mime_type" text NOT NULL,
	"type" "media_asset_type" DEFAULT 'image' NOT NULL,
	"size_bytes" integer,
	"width" integer,
	"height" integer,
	"metadata" jsonb,
	"created_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_size_bytes_non_negative" CHECK ("media_assets"."size_bytes" is null or "media_assets"."size_bytes" >= 0),
	CONSTRAINT "media_assets_width_non_negative" CHECK ("media_assets"."width" is null or "media_assets"."width" >= 0),
	CONSTRAINT "media_assets_height_non_negative" CHECK ("media_assets"."height" is null or "media_assets"."height" >= 0)
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"product_variant_id" text NOT NULL,
	"product_name" text NOT NULL,
	"product_slug" text NOT NULL,
	"variant_sku" text NOT NULL,
	"color_name" text NOT NULL,
	"color_hex" text,
	"size" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"compare_at_price_cents" integer,
	"line_total_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_quantity_positive" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_items_unit_price_cents_non_negative" CHECK ("order_items"."unit_price_cents" >= 0),
	CONSTRAINT "order_items_compare_at_price_cents_non_negative" CHECK ("order_items"."compare_at_price_cents" is null or "order_items"."compare_at_price_cents" >= 0),
	CONSTRAINT "order_items_line_total_cents_non_negative" CHECK ("order_items"."line_total_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"user_id" text,
	"customer_id" text,
	"cart_id" text,
	"coupon_id" text,
	"coupon_code" text,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"fulfillment_status" "fulfillment_status" DEFAULT 'unfulfilled' NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"subtotal_cents" integer NOT NULL,
	"discount_cents" integer DEFAULT 0 NOT NULL,
	"shipping_cents" integer DEFAULT 0 NOT NULL,
	"tax_cents" integer DEFAULT 0 NOT NULL,
	"total_cents" integer NOT NULL,
	"shipping_address" jsonb NOT NULL,
	"billing_address" jsonb,
	"notes" text,
	"placed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	"fulfilled_at" timestamp with time zone,
	"canceled_at" timestamp with time zone,
	"refunded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_subtotal_cents_non_negative" CHECK ("orders"."subtotal_cents" >= 0),
	CONSTRAINT "orders_discount_cents_non_negative" CHECK ("orders"."discount_cents" >= 0),
	CONSTRAINT "orders_shipping_cents_non_negative" CHECK ("orders"."shipping_cents" >= 0),
	CONSTRAINT "orders_tax_cents_non_negative" CHECK ("orders"."tax_cents" >= 0),
	CONSTRAINT "orders_total_cents_non_negative" CHECK ("orders"."total_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"variant_id" text,
	"media_asset_id" text NOT NULL,
	"alt_text" text,
	"position" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_images_product_media_asset_unique" UNIQUE("product_id","media_asset_id"),
	CONSTRAINT "product_images_position_non_negative" CHECK ("product_images"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"sku" text NOT NULL,
	"color_name" text DEFAULT 'Default' NOT NULL,
	"color_hex" text,
	"size" text DEFAULT 'One Size' NOT NULL,
	"price_cents" integer,
	"compare_at_price_cents" integer,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 5 NOT NULL,
	"weight_grams" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_product_color_size_unique" UNIQUE("product_id","color_name","size"),
	CONSTRAINT "product_variants_price_cents_non_negative" CHECK ("product_variants"."price_cents" is null or "product_variants"."price_cents" >= 0),
	CONSTRAINT "product_variants_compare_at_price_cents_non_negative" CHECK ("product_variants"."compare_at_price_cents" is null or "product_variants"."compare_at_price_cents" >= 0),
	CONSTRAINT "product_variants_stock_quantity_non_negative" CHECK ("product_variants"."stock_quantity" >= 0),
	CONSTRAINT "product_variants_low_stock_threshold_non_negative" CHECK ("product_variants"."low_stock_threshold" >= 0),
	CONSTRAINT "product_variants_weight_grams_non_negative" CHECK ("product_variants"."weight_grams" is null or "product_variants"."weight_grams" >= 0),
	CONSTRAINT "product_variants_display_order_non_negative" CHECK ("product_variants"."display_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"subtitle" text,
	"description" text,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"category_id" text,
	"base_price_cents" integer NOT NULL,
	"compare_at_price_cents" integer,
	"cost_cents" integer,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"material" text,
	"fit" text,
	"care_instructions" text,
	"seo_title" text,
	"seo_description" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_base_price_cents_non_negative" CHECK ("products"."base_price_cents" >= 0),
	CONSTRAINT "products_compare_at_price_cents_non_negative" CHECK ("products"."compare_at_price_cents" is null or "products"."compare_at_price_cents" >= 0),
	CONSTRAINT "products_cost_cents_non_negative" CHECK ("products"."cost_cents" is null or "products"."cost_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products_to_collections" (
	"product_id" text NOT NULL,
	"collection_id" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"featured_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_to_collections_pk" PRIMARY KEY("product_id","collection_id"),
	CONSTRAINT "products_to_collections_display_order_non_negative" CHECK ("products_to_collections"."display_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "store_settings" (
	"id" text PRIMARY KEY DEFAULT 'store_settings' NOT NULL,
	"store_name" text DEFAULT 'Clarisse' NOT NULL,
	"store_description" text,
	"contact_email" text,
	"whatsapp_number" text,
	"instagram_url" text,
	"logo_id" text,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"country" text DEFAULT 'BR' NOT NULL,
	"default_shipping_info" text,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "banners" ADD CONSTRAINT "banners_image_id_media_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banners" ADD CONSTRAINT "banners_mobile_image_id_media_assets_id_fk" FOREIGN KEY ("mobile_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_media_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_image_id_media_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products_to_collections" ADD CONSTRAINT "products_to_collections_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products_to_collections" ADD CONSTRAINT "products_to_collections_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_logo_id_media_assets_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "banners_placement_status_idx" ON "banners" USING btree ("placement","status");--> statement-breakpoint
CREATE INDEX "banners_display_order_idx" ON "banners" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "cart_items_cart_id_idx" ON "cart_items" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "cart_items_product_variant_id_idx" ON "cart_items" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "carts_user_id_idx" ON "carts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "carts_customer_id_idx" ON "carts" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "carts_status_idx" ON "carts" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_is_active_idx" ON "categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "categories_display_order_idx" ON "categories" USING btree ("display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "collections_slug_idx" ON "collections" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "collections_is_active_idx" ON "collections" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "collections_is_featured_idx" ON "collections" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "collections_display_order_idx" ON "collections" USING btree ("display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "coupon_redemptions_order_id_idx" ON "coupon_redemptions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_coupon_id_idx" ON "coupon_redemptions" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_customer_id_idx" ON "coupon_redemptions" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupons_is_active_idx" ON "coupons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "customer_addresses_customer_id_idx" ON "customer_addresses" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_email_idx" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_user_id_idx" ON "customers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "inventory_movements_product_variant_id_idx" ON "inventory_movements" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "inventory_movements_order_item_id_idx" ON "inventory_movements" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX "inventory_movements_created_at_idx" ON "inventory_movements" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_key_idx" ON "media_assets" USING btree ("key");--> statement-breakpoint
CREATE INDEX "media_assets_created_by_id_idx" ON "media_assets" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "media_assets_type_idx" ON "media_assets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_product_id_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "order_items_product_variant_id_idx" ON "order_items" USING btree ("product_variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_customer_id_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_payment_status_idx" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "orders_fulfillment_status_idx" ON "orders" USING btree ("fulfillment_status");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "product_images_product_id_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_images_variant_id_idx" ON "product_images" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_images_one_primary_per_product_idx" ON "product_images" USING btree ("product_id") WHERE "product_images"."is_primary" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_sku_idx" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "product_variants_product_id_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variants_is_active_idx" ON "product_variants" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_featured_status_idx" ON "products" USING btree ("is_featured","status");--> statement-breakpoint
CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "products_to_collections_collection_id_idx" ON "products_to_collections" USING btree ("collection_id");