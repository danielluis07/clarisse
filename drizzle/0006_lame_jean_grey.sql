ALTER TABLE "banners" DROP CONSTRAINT "banners_display_order_non_negative";--> statement-breakpoint
DROP INDEX "banners_display_order_idx";--> statement-breakpoint
ALTER TABLE "banners" DROP COLUMN "display_order";