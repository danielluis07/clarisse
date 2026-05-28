ALTER TABLE "banners" DROP CONSTRAINT "banners_date_range_valid";--> statement-breakpoint
ALTER TABLE "banners" DROP COLUMN "starts_at";--> statement-breakpoint
ALTER TABLE "banners" DROP COLUMN "ends_at";