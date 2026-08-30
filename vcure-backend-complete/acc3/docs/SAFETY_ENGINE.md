# Safety Engine Documentation

## Purpose

The Safety Engine is the single hard-blocking gate in the AI pipeline. It
answers exactly one question: *can this proposed set of foods be shown to
this user at all?* Every other engine in the AI layer (Medical Rule,
Nutrition Rule, Explainability) assumes the Safety Engine has already said
yes.

## Design principle: deterministic first

All three rules are direct PostgreSQL relational queries through Prisma —
no LLM call sits in the blocking path. This is intentional: an LLM can
hallucinate or be prompt-injected; a `WHERE` clause against `Allergy` /
`MedicalCondition` / `FoodMedicineInteraction` cannot.

## The three rules

| Rule | Data source | Blocks on |
|---|---|---|
| `AllergyRule` | `Allergy` → `AllergyType` → `FoodRestriction(type=ALLERGY)` | Any proposed food matching an active, non-soft-deleted allergy |
| `MedicalConditionRule` | `MedicalCondition` (active) → `Disease` → `FoodRestriction(type=DISEASE)` | Any proposed food matching an active condition's restriction; critical conditions (`Disease.isCritical=true` — Chronic Kidney Disease, Cirrhosis, Fatty Liver Disease, Pregnancy, Gestational Diabetes, Celiac Disease per the Phase 1 seed) are tagged `[CRITICAL CONDITION]` in the block reason |
| `MedicineInteractionRule` | `Medicine` (active, user's free-text names) ↔ `FoodMedicineInteraction` (generic drug-name catalog, case-insensitive match) | Any proposed food with a cataloged interaction against an active medicine name |

All three rules **always run to completion**, even if one already failed —
`SafetyEngineService.check()` uses `Promise.all`, never short-circuiting, so
the persisted `SafetyValidation` row always has the full picture for audit.

## Result codes

```
PASSED
BLOCKED_ALLERGY
BLOCKED_MEDICAL_CONDITION
BLOCKED_MEDICINE_INTERACTION
BLOCKED_OTHER   (reserved; not currently emitted by any rule — available for
                 future rules without a schema change)
```

## Persistence & audit

Every call to `SafetyEngineService.check()` — pass or block — writes a
`SafetyValidation` row before returning. `checkedAllergies`,
`checkedMedicines`, and `checkedConditions` are always `true` in this
foundation (all three rule types always run); the columns exist so a future
rule addition that's conditionally skipped (e.g. a rule that only applies
to certain regions) can report accurately without a schema change.

## Why the LLM `safety_validation_v1` template is not wired in yet

The template exists (`src/ai/prompt-templates/content/safety-ocr.templates.ts`)
and is explicitly documented as **supplementary pattern-matching**, never a
replacement for the deterministic rules. It is intentionally NOT called from
`SafetyEngineService` in this foundation phase — wiring an LLM call into the
one place in the system that's supposed to be injection-proof would
undermine the design principle above. A future phase could add it as an
additional, non-authoritative signal (e.g. surfaced to a human reviewer),
but it must never be able to flip a `BLOCKED_*` result to `PASSED`.

## Known limitation: medicine name matching

`MedicineInteractionRule` matches on case-insensitive, whitespace-trimmed
string equality between `Medicine.name` (what a user typed) and
`FoodMedicineInteraction.medicineName` (a curated generic name). This will
miss brand names, misspellings, or dosage-suffixed entries (e.g. "Warfarin
5mg" won't match "Warfarin" — actually it WILL match if the medicine name
stored is exactly "Warfarin"; a user who typed "Coumadin" — the brand name
— will NOT match). This is a documented gap, not a silent one: see
`docs/SCHEMA_CHANGELOG.md` for the recommended follow-up (a
brand-name-to-generic-name mapping table) that was deliberately left out of
this phase's scope to avoid further schema growth beyond what the immediate
rule needed.
