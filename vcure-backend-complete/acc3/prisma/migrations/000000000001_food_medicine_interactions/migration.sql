-- ============================================================
-- V-CURE — MIGRATION 000000000001
-- Adds FoodMedicineInteraction (additive only; Phase 2 Safety Engine
-- requirement — see MedicineInteractionRule). No existing table changed.
-- ============================================================

CREATE TABLE "food_medicine_interactions" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "foodId" UUID NOT NULL,
  "medicineName" TEXT NOT NULL,
  "interactionSeverity" "Severity" DEFAULT 'MEDIUM' NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

CREATE INDEX "idx_food_medicine_interactions_foodId" ON "food_medicine_interactions" ("foodId");
CREATE INDEX "idx_food_medicine_interactions_medicineName" ON "food_medicine_interactions" ("medicineName");

ALTER TABLE "food_medicine_interactions" ADD CONSTRAINT "fk_food_medicine_interactions_foodId"
  FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
