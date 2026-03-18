CREATE TABLE "fund_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_product_id" uuid NOT NULL,
	"target_product_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"admin_username" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fund_transfers" ADD CONSTRAINT "fund_transfers_source_product_id_products_id_fk" FOREIGN KEY ("source_product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_transfers" ADD CONSTRAINT "fund_transfers_target_product_id_products_id_fk" FOREIGN KEY ("target_product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fund_transfers_created_at_idx" ON "fund_transfers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "fund_transfers_source_product_id_idx" ON "fund_transfers" USING btree ("source_product_id");--> statement-breakpoint
CREATE INDEX "fund_transfers_target_product_id_idx" ON "fund_transfers" USING btree ("target_product_id");