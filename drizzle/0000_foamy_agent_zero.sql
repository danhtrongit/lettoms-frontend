CREATE TYPE "public"."user_role" AS ENUM('admin', 'staff', 'customer');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('nu', 'nam', 'tre-em', 'em-be');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cod', 'sepay');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "public"."page_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"password_hash" text,
	"phone" text,
	"image" text,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"gender" "gender" NOT NULL,
	"parent_id" text,
	"description" text,
	"hero_image" text,
	"icon_image" text,
	"seo_title" text,
	"seo_description" text,
	"og_image" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "colors" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"hex" text NOT NULL,
	"chip" text
);
--> statement-breakpoint
CREATE TABLE "product_colors" (
	"product_id" text NOT NULL,
	"color_code" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_colors_product_id_color_code_pk" PRIMARY KEY("product_id","color_code")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"src" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"color_code" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_sizes" (
	"product_id" text NOT NULL,
	"size_code" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_sizes_product_id_size_code_pk" PRIMARY KEY("product_id","size_code")
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"color_code" text NOT NULL,
	"size_code" text NOT NULL,
	"sku" text NOT NULL,
	"price" integer NOT NULL,
	"original_price" integer,
	"stock" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"gender" "gender" NOT NULL,
	"category_id" text,
	"subcategory_id" text,
	"description" text DEFAULT '' NOT NULL,
	"materials" text DEFAULT '' NOT NULL,
	"care" text DEFAULT '' NOT NULL,
	"base_price" integer NOT NULL,
	"original_price" integer,
	"flags" text[] DEFAULT '{}' NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"thumbnail" text,
	"seo_title" text,
	"seo_description" text,
	"og_image" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sizes" (
	"code" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"og_image" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "article_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"category_id" text,
	"cover_image" text,
	"author" text DEFAULT 'Letom''s' NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"reading_minutes" integer DEFAULT 3 NOT NULL,
	"body" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"related_product_ids" text[] DEFAULT '{}' NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"og_image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY NOT NULL,
	"folder_id" text,
	"filename" text NOT NULL,
	"url" text NOT NULL,
	"mime" text NOT NULL,
	"width" integer,
	"height" integer,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_folders" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parent_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"line1" text NOT NULL,
	"ward" text,
	"district" text,
	"province" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text,
	"variant_id" text,
	"sku" text NOT NULL,
	"name_snapshot" text NOT NULL,
	"image" text,
	"color_name" text,
	"size_label" text,
	"unit_price" integer NOT NULL,
	"quantity" integer NOT NULL,
	"line_total" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"user_id" text,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"payment_method" "payment_method" DEFAULT 'cod' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"customer_email" text,
	"shipping_address" jsonb NOT NULL,
	"note" text,
	"subtotal" integer NOT NULL,
	"shipping_fee" integer DEFAULT 0 NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"sepay_ref" text,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "menus" (
	"key" text PRIMARY KEY NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"status" "page_status" DEFAULT 'draft' NOT NULL,
	"blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"og_image" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_colors" ADD CONSTRAINT "product_colors_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_colors" ADD CONSTRAINT "product_colors_color_code_colors_code_fk" FOREIGN KEY ("color_code") REFERENCES "public"."colors"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_sizes" ADD CONSTRAINT "product_sizes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_sizes" ADD CONSTRAINT "product_sizes_size_code_sizes_code_fk" FOREIGN KEY ("size_code") REFERENCES "public"."sizes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_color_code_colors_code_fk" FOREIGN KEY ("color_code") REFERENCES "public"."colors"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_size_code_sizes_code_fk" FOREIGN KEY ("size_code") REFERENCES "public"."sizes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_id_categories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_article_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."article_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_media_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."media_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_gender_slug_idx" ON "categories" USING btree ("gender","slug");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "product_images_product_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "variant_product_color_size_idx" ON "product_variants" USING btree ("product_id","color_code","size_code");--> statement-breakpoint
CREATE INDEX "variant_product_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "products_gender_idx" ON "products" USING btree ("gender");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_active_idx" ON "products" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "articles_published_idx" ON "articles" USING btree ("is_published","published_at");--> statement-breakpoint
CREATE INDEX "media_folder_idx" ON "media" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "media_created_idx" ON "media" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "addresses_user_idx" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_created_idx" ON "orders" USING btree ("created_at");