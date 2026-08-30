# Schema Changelog

Tracks every schema change made after the Phase 1 initial migration, per the
Phase 2 requirement: *"Every additive schema extension must create a
migration, update ER diagram, update Prisma schema documentation, update
seed documentation, update API contracts (if affected), preserve backward
compatibility. Never modify existing relations when an additive extension is
sufficient."*

---

## Migration `000000000001_food_medicine_interactions`

**Date added:** Phase 2 (Safety Engine implementation)
**Type:** Additive only — one new table, one new relation on an existing
table's `Food` model (a new array field, not a change to any existing field).

### Why

`MedicineInteractionRule` (Safety Engine) needs to answer: "does this
proposed food interact with a medicine this user takes?" The Phase 1 schema
has no way to express this:
- `FoodRestriction` links `Food` to `Disease` or `AllergyType` only — no
  medicine foreign key column exists on it.
- `Medicine` is a **per-user, free-text** table (`Medicine.name` is whatever
  the user typed when logging their medication) — not a drug catalog. Adding
  a FK from `FoodRestriction` to `Medicine` would be wrong anyway, since
  that would tie a catalog-level fact ("grapefruit interacts with statins")
  to one specific user's medicine row instead of the general drug class.

### What was added

```prisma
model FoodMedicineInteraction {
  id                 String   @id @default(uuid()) @db.Uuid
  foodId             String   @db.Uuid
  medicineName       String // generic/common drug name, e.g. "Warfarin"
  interactionSeverity Severity @default(MEDIUM)
  description        String   @db.Text

  food Food @relation(fields: [foodId], references: [id], onDelete: Cascade)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([foodId])
  @@index([medicineName])
  @@map("food_medicine_interactions")
}
```

Plus, on the existing `Food` model, one additive relation field:
```prisma
medicineInteractions FoodMedicineInteraction[]
```

### Backward compatibility

- **No existing table was altered.** No column added/removed/renamed on
  `Food`, `FoodRestriction`, `Medicine`, or any other Phase 1 table.
- **No existing relation was modified.** The new `Food.medicineInteractions`
  field is a new array relation, additive by construction — Prisma array
  relation fields don't correspond to a database column on the `Food` side
  (the FK lives on the child table), so no migration touches the `foods`
  table itself.
- **No existing FK/index/constraint changed.** Migration
  `000000000001` only issues `CREATE TABLE`, `CREATE INDEX`, and one
  `ALTER TABLE ... ADD CONSTRAINT` — all against the new table.
- Any code written against the Phase 1 schema continues to compile and run
  unmodified.

### Seed data

`prisma/seed/food-medicine-interactions.seed.ts` — starter set of 5
well-established food-drug interaction pairs (Grapefruit/Statins,
Spinach/Warfarin, Kale/Warfarin, Banana/ACE Inhibitors, Milk/Tetracycline).
**Known gap:** these seeds reference `Food` rows by name (`Food.findFirst
({ where: { name } })`) and silently skip if not found — because the Phase 1
`Food` catalog itself was not populated with actual food rows (that's
content-ops scope, not AI-foundation scope). Once the Food catalog is
populated, re-run `npm run seed` to backfill these interaction rows.

### API contracts

No REST/GraphQL API contracts exist yet in this codebase (Phase 1/2 have
been Database + AI layers only, no controllers per the master prompt's "You
are NOT responsible for... NestJS Controllers" scope boundary). Nothing to
update. When API contracts are built (a future phase), any endpoint
exposing food safety data should include `medicineInteractions` as an
optional expand/include on `Food`, following the same pattern as
`restrictions`.

### ER diagram

See `docs/ARCHITECTURE_DIAGRAMS.md` §4.
