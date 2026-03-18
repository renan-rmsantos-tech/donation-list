-- =============================================================================
-- Church Donations Platform - Schema Inicial
-- =============================================================================
-- Cria o schema completo do zero (consolidado das migrations Drizzle)
-- Executado por: supabase db reset (antes do seed.sql)
-- =============================================================================

-- Enum para tipo de doação
CREATE TYPE "public"."donation_type" AS ENUM('monetary', 'physical');

-- Tabela de categorias
CREATE TABLE "public"."categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "categories_name_unique" UNIQUE("name")
);

-- Tabela de produtos (sem donation_type - removido em migration posterior)
CREATE TABLE "public"."products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "target_amount" integer,
  "current_amount" integer DEFAULT 0 NOT NULL,
  "is_fulfilled" boolean DEFAULT false NOT NULL,
  "is_published" boolean DEFAULT true NOT NULL,
  "image_path" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Tabela de doações
CREATE TABLE "public"."donations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL,
  "donation_type" "donation_type" NOT NULL,
  "amount" integer,
  "donor_name" text,
  "donor_phone" text,
  "donor_email" text,
  "receipt_path" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Tabela de configuração PIX
CREATE TABLE "public"."pix_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "qr_code_image_path" text,
  "copia_e_cola_code" text,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Tabela de relacionamento produto-categoria
CREATE TABLE "public"."product_categories" (
  "product_id" uuid NOT NULL,
  "category_id" uuid NOT NULL,
  CONSTRAINT "product_categories_product_id_category_id_pk" PRIMARY KEY("product_id", "category_id")
);

-- Tabela de transferências entre produtos
CREATE TABLE "public"."fund_transfers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "source_product_id" uuid NOT NULL,
  "target_product_id" uuid NOT NULL,
  "amount" integer NOT NULL,
  "admin_username" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Foreign keys
ALTER TABLE "public"."donations"
  ADD CONSTRAINT "donations_product_id_products_id_fk"
  FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "public"."product_categories"
  ADD CONSTRAINT "product_categories_product_id_products_id_fk"
  FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "public"."product_categories"
  ADD CONSTRAINT "product_categories_category_id_categories_id_fk"
  FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "public"."fund_transfers"
  ADD CONSTRAINT "fund_transfers_source_product_id_products_id_fk"
  FOREIGN KEY ("source_product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;

ALTER TABLE "public"."fund_transfers"
  ADD CONSTRAINT "fund_transfers_target_product_id_products_id_fk"
  FOREIGN KEY ("target_product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;

-- Índices para fund_transfers
CREATE INDEX "fund_transfers_created_at_idx" ON "public"."fund_transfers" USING btree ("created_at");
CREATE INDEX "fund_transfers_source_product_id_idx" ON "public"."fund_transfers" USING btree ("source_product_id");
CREATE INDEX "fund_transfers_target_product_id_idx" ON "public"."fund_transfers" USING btree ("target_product_id");
