ALTER TABLE "banners" ADD COLUMN "focal_x" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "banners" ADD COLUMN "focal_y" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "banners" ADD COLUMN "mobile_focal_x" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "banners" ADD COLUMN "mobile_focal_y" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "banners" ADD CONSTRAINT "banners_focal_within_bounds" CHECK ("banners"."focal_x" between 0 and 100 and "banners"."focal_y" between 0 and 100 and "banners"."mobile_focal_x" between 0 and 100 and "banners"."mobile_focal_y" between 0 and 100);