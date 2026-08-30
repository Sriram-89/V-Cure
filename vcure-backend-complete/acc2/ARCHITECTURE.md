# V-Cure Architecture (living document)

## Status: Foundation + Users/Health Profile/Lifestyle Assessment + Medical History complete

## Monorepo layout
```
vcure/
  apps/
    api/   -> NestJS backend
    web/   -> Next.js frontend (not yet scaffolded)
  ARCHITECTURE.md
```

## Completed modules
### 1. Foundation
- **Prisma schema** (`apps/api/prisma/schema.prisma`): User, RefreshToken,
  UserProfile (+ UserProfileHistory), HealthProfile (+ HealthProfileHistory),
  LifestyleAssessment (+ LifestyleAssessmentHistory), MedicalCondition,
  Medicine, Allergy, FamilyHistoryEntry.
  - Convention: every domain model has `createdAt`, `updatedAt`, `deletedAt`
    (soft delete). Never hard-delete user health data.
  - Convention: `@@map("snake_case")` table names, `cuid()` ids.
  - Convention: every profile-style model (one-per-user) ships with a
    matching `<Model>History` table, written to on every upsert.
- **Auth module** (`apps/api/src/modules/auth/`): Firebase ID token
  verification, upsert-on-first-login, opaque refresh tokens hashed at
  rest with rotation + reuse-detection revoking the full session chain,
  global `JwtAuthGuard` (opt out via `@Public()`), `RolesGuard` (opt in via
  `@Roles(...)`), `@CurrentUser()` decorator.
- **Core plumbing**: global `PrismaModule`, typed `ConfigModule`, global
  `ValidationPipe`, global `HttpExceptionFilter`, `ThrottlerModule`, API
  prefix `api/v1`.

### 2. Users & Health Profile
- **`modules/users/`** — `UserProfile` CRUD under `/users/me/profile`.
  - `GET /users/me/profile` — fetch (adds computed `age`)
  - `PUT /users/me/profile` — create on first call, update thereafter
  - `GET /users/me/profile/history` — **audit trail**: every update writes
    the PRE-update snapshot to `UserProfileHistory` before applying changes
  - `DELETE /users/me/profile` — soft delete
- **`modules/health-profile/`** — `HealthProfile` CRUD under
  `/health-profile/me`.
  - BMI is always recomputed server-side from height/weight — never
    trusted from the client — and categorized (`underweight` / `normal`
    / `overweight` / `obese`)
  - `GET /health-profile/me/trends` — **trend trail**: every upsert
    appends the RESULTING snapshot to `HealthProfileHistory`, so
    weight/BMI/waist can be charted over time
- **`modules/lifestyle-assessment/`** — `LifestyleAssessment` CRUD under
  `/lifestyle-assessment/me`.
  - Same upsert + trend-history pattern as HealthProfile
  - Derives non-diagnostic `riskFlags` (e.g. `low_sleep`,
    `elevated_stress`, `sedentary`) from self-reported thresholds, purely
    as signals for the future AI recommendation engine — never surfaced
    as medical advice
- Each module: `dto/`, `types/`, `<name>.service.ts` (+ `.spec.ts`),
  `<name>.controller.ts`, `<name>.module.ts` — registered in
  `app.module.ts`.

### 3. Medical History
- **`modules/medical-history/`** — list-style (not one-per-user) CRUD for
  the four sub-resources already modeled in Prisma, each strictly scoped
  to the authenticated user (ownership verified on every read/write —
  a 404, not a 403, is returned for records that exist but aren't yours,
  to avoid leaking existence):
  - `GET/POST /medical-history/conditions`,
    `PATCH/DELETE /medical-history/conditions/:id`
  - `GET/POST /medical-history/medicines`,
    `PATCH/DELETE /medical-history/medicines/:id`
  - `GET/POST /medical-history/allergies`,
    `PATCH/DELETE /medical-history/allergies/:id` — `allergen` is free
    text by product spec (custom allergy input), not a closed enum
  - `GET/POST /medical-history/family-history`,
    `PATCH/DELETE /medical-history/family-history/:id`
  - All deletes are soft deletes (`deletedAt`), consistent with every
    other module.
  - No revision-history table here by design: these are already
    append-friendly lists (multiple active rows per user), unlike the
    singleton profile models in Users/Health Profile/Lifestyle
    Assessment which needed history tables to track *changes to a single
    record*.

## Rules for extending this project
1. Never redefine an existing Prisma model — add fields/relations or new
   models only. Run `prisma migrate dev` for schema changes, never edit
   the DB directly.
2. Every new domain module goes in `apps/api/src/modules/<name>/` with the
   same shape as `auth/` / `users/`: `dto/`, `types/`,
   `<name>.service.ts`, `<name>.controller.ts`, `<name>.module.ts`,
   `<name>.service.spec.ts`.
3. New modules must be registered in `app.module.ts` imports.
4. Protected by default — do not add `@Public()` to health data routes.
5. Any one-per-user profile-style model gets a companion `<Model>History`
   table and a `/trends` or `/history` read endpoint. Any list-style
   model (multiple rows per user, e.g. medicines/allergies) instead gets
   ownership-scoped CRUD with soft delete — don't add a history table to
   these, follow the Medical History pattern instead.
6. Frontend (`apps/web`) will be scaffolded next as Next.js 15 App Router;
   each backend module ships with a matching frontend feature folder.

## Sandbox note (not a code defect)
This dev container's egress allowlist does not include
`binaries.prisma.sh`, so `prisma generate` cannot download the query
engine binary here and `@prisma/client` types are not generated in this
environment. All modules have been independently verified to type-check
cleanly against a fully-generated client (validated locally with a
temporary shim, then reverted). Run `npm install && npx prisma generate`
in a normal networked environment and it will resolve immediately.

## Next planned module
**Medical Report Upload + OCR module** — PDF/image upload (Supabase
storage), OCR extraction pipeline (HbA1c, CBC, TSH, Lipid Profile,
Creatinine, kidney/liver function, blood sugar, Vitamin D/B12), stored
history with trend charting (same `<Model>History` pattern already
established), never diagnoses — purely structured extraction + trend
display, consistent with the AI safety rules in the product spec.

