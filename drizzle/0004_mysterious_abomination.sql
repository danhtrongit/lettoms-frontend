ALTER TABLE "categories" ALTER COLUMN "gender" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "gender" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."gender";--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('nu', 'nam');--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "gender" SET DATA TYPE "public"."gender" USING "gender"::"public"."gender";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "gender" SET DATA TYPE "public"."gender" USING "gender"::"public"."gender";