-- Baseline completo do schema (estado após migrações Drizzle 0000–0004).
-- Idempotente: usa IF NOT EXISTS em todos os objetos.
-- Usado pelo Supabase CLI em `supabase db reset` (dev local) e como ponto
-- de partida para o tracking via Supabase MCP em produção.

-- ── ENUMs ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "public"."donation_type" AS ENUM('monetary', 'physical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."donation_mode" AS ENUM('monetary', 'physical', 'both');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── TABLES ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "categories" (
  "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"       text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "categories_name_unique" UNIQUE("name")
);

CREATE TABLE IF NOT EXISTS "products" (
  "id"             uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"           text NOT NULL,
  "description"    text NOT NULL,
  "target_amount"  integer,
  "current_amount" integer DEFAULT 0 NOT NULL,
  "is_fulfilled"   boolean DEFAULT false NOT NULL,
  "is_published"   boolean DEFAULT true NOT NULL,
  "image_path"     text,
  "donation_mode"  "donation_mode" DEFAULT 'both' NOT NULL,
  "created_at"     timestamp DEFAULT now() NOT NULL,
  "updated_at"     timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "donations" (
  "id"            uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id"    uuid NOT NULL,
  "donation_type" "donation_type" NOT NULL,
  "amount"        integer,
  "donor_name"    text,
  "donor_phone"   text,
  "donor_email"   text,
  "receipt_path"  text,
  "created_at"    timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pix_settings" (
  "id"                 uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "qr_code_image_path" text,
  "copia_e_cola_code"  text,
  "updated_at"         timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "product_categories" (
  "product_id"  uuid NOT NULL,
  "category_id" uuid NOT NULL,
  CONSTRAINT "product_categories_product_id_category_id_pk" PRIMARY KEY("product_id", "category_id")
);

CREATE TABLE IF NOT EXISTS "fund_transfers" (
  "id"                uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "source_product_id" uuid NOT NULL,
  "target_product_id" uuid NOT NULL,
  "amount"            integer NOT NULL,
  "admin_username"    text NOT NULL,
  "created_at"        timestamp DEFAULT now() NOT NULL
);

-- ── FOREIGN KEYS ─────────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE "donations"
    ADD CONSTRAINT "donations_product_id_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "product_categories"
    ADD CONSTRAINT "product_categories_product_id_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "product_categories"
    ADD CONSTRAINT "product_categories_category_id_categories_id_fk"
    FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "fund_transfers"
    ADD CONSTRAINT "fund_transfers_source_product_id_products_id_fk"
    FOREIGN KEY ("source_product_id") REFERENCES "public"."products"("id") ON DELETE restrict;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "fund_transfers"
    ADD CONSTRAINT "fund_transfers_target_product_id_products_id_fk"
    FOREIGN KEY ("target_product_id") REFERENCES "public"."products"("id") ON DELETE restrict;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── INDEXES ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "fund_transfers_created_at_idx"
  ON "fund_transfers" USING btree ("created_at");

CREATE INDEX IF NOT EXISTS "fund_transfers_source_product_id_idx"
  ON "fund_transfers" USING btree ("source_product_id");

CREATE INDEX IF NOT EXISTS "fund_transfers_target_product_id_idx"
  ON "fund_transfers" USING btree ("target_product_id");

CREATE INDEX IF NOT EXISTS "idx_products_is_published"
  ON "public"."products" USING btree ("is_published")
  WHERE is_published = true;
