CREATE TYPE "public"."order_source" AS ENUM('storefront', 'admin');--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "description_json" jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "description_html" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "materials_json" jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "materials_html" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "care_json" jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "care_html" text;--> statement-breakpoint
ALTER TABLE "article_categories" ADD COLUMN "thumbnail" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "content_json" jsonb;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "content_html" text;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "ward_code" text;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "province_code" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "source" "order_source" DEFAULT 'storefront' NOT NULL;