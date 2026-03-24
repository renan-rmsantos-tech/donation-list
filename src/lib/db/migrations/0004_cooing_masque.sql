CREATE TYPE "public"."donation_mode" AS ENUM('monetary', 'physical', 'both');--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "donation_mode" "donation_mode" DEFAULT 'both' NOT NULL;