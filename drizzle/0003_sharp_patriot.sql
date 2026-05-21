ALTER TABLE "product_images" DROP CONSTRAINT "product_images_product_variant_consistency_fk";
--> statement-breakpoint
ALTER TABLE "product_images" ADD COLUMN "color_name" text;--> statement-breakpoint
ALTER TABLE "product_images" ADD COLUMN "color_hex" text;--> statement-breakpoint
UPDATE "product_images" AS "pi"
SET "color_name" = "pv"."color_name",
    "color_hex" = "pv"."color_hex"
FROM "product_variants" AS "pv"
WHERE "pi"."variant_id" = "pv"."id";--> statement-breakpoint
CREATE INDEX "product_images_product_color_idx" ON "product_images" USING btree ("product_id","color_name");--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_color_hex_format" CHECK ("product_images"."color_hex" is null or "product_images"."color_hex" ~ '^#[0-9a-fA-F]{6}$');
