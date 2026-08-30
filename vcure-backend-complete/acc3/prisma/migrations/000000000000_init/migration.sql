-- ============================================================
-- V-CURE — INITIAL DATABASE MIGRATION
-- Generated from prisma/schema.prisma (hand-rolled generator —
-- see scripts/generate_migration.py; regenerate with the real
-- Prisma migration engine once DB connectivity is available).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- ENUM TYPES ----------
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
CREATE TYPE "ActivityLevelEnum" AS ENUM ('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTREMELY_ACTIVE');
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'BEVERAGE');
CREATE TYPE "DiseaseSeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'CRITICAL');
CREATE TYPE "GoalType" AS ENUM ('WEIGHT_LOSS', 'WEIGHT_GAIN', 'MUSCLE_GAIN', 'MAINTENANCE', 'DISEASE_MANAGEMENT', 'GENERAL_WELLNESS', 'PREGNANCY_CARE', 'ATHLETIC_PERFORMANCE');
CREATE TYPE "SubscriptionPlanType" AS ENUM ('FREE', 'PREMIUM_MONTHLY', 'PREMIUM_YEARLY', 'FAMILY', 'CORPORATE');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELLED', 'EXPIRED');
CREATE TYPE "RoleType" AS ENUM ('USER', 'ADMIN', 'DOCTOR', 'DIETITIAN', 'SUPPORT', 'SUPER_ADMIN');
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'DELETED');
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "ReportSourceType" AS ENUM ('MANUAL_UPLOAD', 'OCR_EXTRACTED', 'LAB_PARTNER_SYNC', 'DOCTOR_UPLOAD');
CREATE TYPE "OCRStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'MANUAL_REVIEW_REQUIRED');
CREATE TYPE "FoodRestrictionType" AS ENUM ('ALLERGY', 'DISEASE', 'RELIGIOUS', 'LIFESTYLE', 'MEDICATION_INTERACTION');
CREATE TYPE "RecommendationStatus" AS ENUM ('GENERATED', 'DISPLAYED', 'ACCEPTED', 'REJECTED', 'SUBSTITUTED', 'EXPIRED');
CREATE TYPE "FeedbackType" AS ENUM ('LIKE', 'DISLIKE', 'HELPFUL', 'NOT_HELPFUL');
CREATE TYPE "FeedbackReason" AS ENUM ('TASTE', 'COST', 'AVAILABILITY', 'MEDICAL_ISSUE', 'TIME_CONSTRAINT', 'OTHER');
CREATE TYPE "SafetyValidationResult" AS ENUM ('PASSED', 'BLOCKED_ALLERGY', 'BLOCKED_MEDICAL_CONDITION', 'BLOCKED_MEDICINE_INTERACTION', 'BLOCKED_OTHER');
CREATE TYPE "TrackingSource" AS ENUM ('MANUAL', 'AI_SUGGESTED', 'DEVICE_SYNC', 'WEARABLE');
CREATE TYPE "MoodLevel" AS ENUM ('VERY_LOW', 'LOW', 'NEUTRAL', 'GOOD', 'VERY_GOOD');
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED');
CREATE TYPE "ConversationRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');
CREATE TYPE "PromptTemplateCategory" AS ENUM ('MEAL_RECOMMENDATION', 'HEALTH_ASSESSMENT', 'RISK_ANALYSIS', 'LIFESTYLE_RECOMMENDATION', 'EXPLAINABILITY', 'OCR_EXTRACTION', 'CHAT', 'SAFETY_VALIDATION');
CREATE TYPE "AIProvider" AS ENUM ('OPENAI_COMPATIBLE', 'GEMINI');
CREATE TYPE "FeatureFlagStatus" AS ENUM ('ENABLED', 'DISABLED', 'ROLLOUT_PERCENTAGE');
CREATE TYPE "NotificationChannel" AS ENUM ('PUSH', 'EMAIL', 'SMS', 'IN_APP');
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'READ');
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- ---------- User ----------
CREATE TABLE "users" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "firebaseUid" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN DEFAULT false NOT NULL,
  "phoneNumber" TEXT UNIQUE,
  "phoneVerified" BOOLEAN DEFAULT false NOT NULL,
  "passwordHash" TEXT,
  "status" "AccountStatus" DEFAULT 'PENDING_VERIFICATION' NOT NULL,
  "onboardingComplete" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdBy" UUID,
  "updatedBy" UUID,
  PRIMARY KEY ("id")
);

-- ---------- Role ----------
CREATE TABLE "roles" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" "RoleType" NOT NULL UNIQUE,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- Permission ----------
CREATE TABLE "permissions" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "code" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- RolePermission ----------
CREATE TABLE "role_permissions" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "roleId" UUID NOT NULL,
  "permissionId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- UserRole ----------
CREATE TABLE "user_roles" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "roleId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- Session ----------
CREATE TABLE "sessions" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "deviceId" UUID,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- RefreshToken ----------
CREATE TABLE "refresh_tokens" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- Device ----------
CREATE TABLE "devices" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "fcmToken" TEXT UNIQUE,
  "platform" TEXT NOT NULL,
  "deviceModel" TEXT,
  "lastActiveAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- LoginHistory ----------
CREATE TABLE "login_history" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "success" BOOLEAN NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- PasswordReset ----------
CREATE TABLE "password_resets" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- UserProfile ----------
CREATE TABLE "user_profiles" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL UNIQUE,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "dateOfBirth" TIMESTAMP(3),
  "gender" "Gender",
  "avatarUrl" TEXT,
  "countryId" UUID,
  "stateId" UUID,
  "cityId" UUID,
  "religionId" UUID,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdBy" UUID,
  "updatedBy" UUID,
  PRIMARY KEY ("id")
);

-- ---------- Address ----------
CREATE TABLE "addresses" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "label" TEXT,
  "line1" TEXT NOT NULL,
  "line2" TEXT,
  "cityId" UUID,
  "stateId" UUID,
  "countryId" UUID,
  "postalCode" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "isDefault" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- EmergencyContact ----------
CREATE TABLE "emergency_contacts" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "relationship" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "email" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- LanguagePreference ----------
CREATE TABLE "language_preferences" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL UNIQUE,
  "primaryLanguageId" UUID NOT NULL,
  "secondaryLanguageId" UUID,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- NotificationPreference ----------
CREATE TABLE "notification_preferences" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL UNIQUE,
  "pushEnabled" BOOLEAN DEFAULT true NOT NULL,
  "emailEnabled" BOOLEAN DEFAULT true NOT NULL,
  "smsEnabled" BOOLEAN DEFAULT false NOT NULL,
  "mealReminders" BOOLEAN DEFAULT true NOT NULL,
  "waterReminders" BOOLEAN DEFAULT true NOT NULL,
  "exerciseReminders" BOOLEAN DEFAULT true NOT NULL,
  "medicineReminders" BOOLEAN DEFAULT true NOT NULL,
  "quietHoursStart" TEXT,
  "quietHoursEnd" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- Subscription ----------
CREATE TABLE "subscriptions" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "planId" UUID NOT NULL,
  "status" "SubscriptionStatus" DEFAULT 'ACTIVE' NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "autoRenew" BOOLEAN DEFAULT true NOT NULL,
  "paymentProviderRef" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- UserSettings ----------
CREATE TABLE "user_settings" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL UNIQUE,
  "measurementSystem" TEXT DEFAULT 'metric' NOT NULL,
  "themePreference" TEXT DEFAULT 'system' NOT NULL,
  "dataSharingConsent" BOOLEAN DEFAULT false NOT NULL,
  "marketingConsent" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- HealthProfile ----------
CREATE TABLE "health_profiles" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL UNIQUE,
  "age" INTEGER NOT NULL,
  "gender" "Gender" NOT NULL,
  "heightCm" DOUBLE PRECISION NOT NULL,
  "weightKg" DOUBLE PRECISION NOT NULL,
  "waistCm" DOUBLE PRECISION,
  "activityLevel" "ActivityLevelEnum" NOT NULL,
  "primaryGoal" "GoalType" NOT NULL,
  "bmi" DOUBLE PRECISION NOT NULL,
  "bmr" DOUBLE PRECISION,
  "dailyCalorieTarget" DOUBLE PRECISION,
  "isComplete" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdBy" UUID,
  "updatedBy" UUID,
  PRIMARY KEY ("id")
);

-- ---------- BodyMeasurements ----------
CREATE TABLE "body_measurements" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "heightCm" DOUBLE PRECISION NOT NULL,
  "weightKg" DOUBLE PRECISION NOT NULL,
  "waistCm" DOUBLE PRECISION,
  "hipCm" DOUBLE PRECISION,
  "chestCm" DOUBLE PRECISION,
  "bodyFatPct" DOUBLE PRECISION,
  "muscleMassKg" DOUBLE PRECISION,
  "measuredAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- BMIHistory ----------
CREATE TABLE "bmi_history" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "bmi" DOUBLE PRECISION NOT NULL,
  "weightKg" DOUBLE PRECISION NOT NULL,
  "heightCm" DOUBLE PRECISION NOT NULL,
  "recordedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- HealthGoal ----------
CREATE TABLE "health_goals" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "goalType" "GoalType" NOT NULL,
  "targetValue" DOUBLE PRECISION,
  "targetDate" TIMESTAMP(3),
  "achieved" BOOLEAN DEFAULT false NOT NULL,
  "achievedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- Lifestyle ----------
CREATE TABLE "lifestyles" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL UNIQUE,
  "occupation" TEXT,
  "activityLevel" "ActivityLevelEnum" NOT NULL,
  "smokingStatus" TEXT,
  "alcoholStatus" TEXT,
  "stressLevel" TEXT,
  "sleepHoursAvg" DOUBLE PRECISION,
  "waterIntakeGoalMl" INTEGER,
  "isComplete" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- DailyLifestyle ----------
CREATE TABLE "daily_lifestyles" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "date" DATE NOT NULL,
  "sleepHours" DOUBLE PRECISION,
  "stressLevel" TEXT,
  "screenTimeMinutes" INTEGER,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- Vitals ----------
CREATE TABLE "vitals" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "systolicBP" INTEGER,
  "diastolicBP" INTEGER,
  "heartRateBpm" INTEGER,
  "bloodGlucoseMgDl" DOUBLE PRECISION,
  "spo2Pct" DOUBLE PRECISION,
  "temperatureCelsius" DOUBLE PRECISION,
  "recordedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "source" "TrackingSource" DEFAULT 'MANUAL' NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- HealthScore ----------
CREATE TABLE "health_scores" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "breakdown" JSONB NOT NULL,
  "calculatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- DiseaseCategory ----------
CREATE TABLE "disease_categories" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- Disease ----------
CREATE TABLE "diseases" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "categoryId" UUID NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "isChronic" BOOLEAN DEFAULT false NOT NULL,
  "isCritical" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- MedicalCondition ----------
CREATE TABLE "medical_conditions" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "diseaseId" UUID NOT NULL,
  "severity" "DiseaseSeverity" NOT NULL,
  "diagnosedAt" TIMESTAMP(3),
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdBy" UUID,
  "updatedBy" UUID,
  PRIMARY KEY ("id")
);

-- ---------- Medicine ----------
CREATE TABLE "medicines" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "dosage" TEXT,
  "frequency" TEXT,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "prescribedBy" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdBy" UUID,
  "updatedBy" UUID,
  PRIMARY KEY ("id")
);

-- ---------- MedicineSchedule ----------
CREATE TABLE "medicine_schedules" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "medicineId" UUID NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "takenAt" TIMESTAMP(3),
  "skipped" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- AllergyType ----------
CREATE TABLE "allergy_types" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- Allergy ----------
CREATE TABLE "allergies" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "allergyTypeId" UUID NOT NULL,
  "severity" "DiseaseSeverity" NOT NULL,
  "reaction" TEXT,
  "diagnosedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdBy" UUID,
  "updatedBy" UUID,
  PRIMARY KEY ("id")
);

-- ---------- MedicalReport ----------
CREATE TABLE "medical_reports" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "reportDate" TIMESTAMP(3) NOT NULL,
  "sourceType" "ReportSourceType" DEFAULT 'MANUAL_UPLOAD' NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdBy" UUID,
  "updatedBy" UUID,
  PRIMARY KEY ("id")
);

-- ---------- MedicalReportFile ----------
CREATE TABLE "medical_report_files" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "medicalReportId" UUID NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "uploadedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- LabResult ----------
CREATE TABLE "lab_results" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "medicalReportId" UUID NOT NULL,
  "testName" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "unit" TEXT,
  "referenceRange" TEXT,
  "isAbnormal" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- OCRResult ----------
CREATE TABLE "ocr_results" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "medicalReportId" UUID NOT NULL,
  "status" "OCRStatus" DEFAULT 'PENDING' NOT NULL,
  "rawExtractedText" TEXT,
  "structuredData" JSONB,
  "confidenceScore" DOUBLE PRECISION,
  "reviewedByUser" BOOLEAN DEFAULT false NOT NULL,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- FamilyHistory ----------
CREATE TABLE "family_history" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "relation" TEXT NOT NULL,
  "condition" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- SymptomHistory ----------
CREATE TABLE "symptom_history" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "symptom" TEXT NOT NULL,
  "severity" "Severity" NOT NULL,
  "notedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- FoodCategory ----------
CREATE TABLE "food_categories" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- Food ----------
CREATE TABLE "foods" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "categoryId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isVegetarian" BOOLEAN DEFAULT true NOT NULL,
  "isVegan" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- FoodNutrition ----------
CREATE TABLE "food_nutrition" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "foodId" UUID NOT NULL UNIQUE,
  "caloriesKcal" DOUBLE PRECISION NOT NULL,
  "proteinG" DOUBLE PRECISION NOT NULL,
  "carbsG" DOUBLE PRECISION NOT NULL,
  "fatG" DOUBLE PRECISION NOT NULL,
  "fiberG" DOUBLE PRECISION,
  "sugarG" DOUBLE PRECISION,
  "sodiumMg" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- FoodServing ----------
CREATE TABLE "food_servings" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "foodId" UUID NOT NULL,
  "servingName" TEXT NOT NULL,
  "gramsEquivalent" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- FoodRestriction ----------
CREATE TABLE "food_restrictions" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "foodId" UUID NOT NULL,
  "type" "FoodRestrictionType" NOT NULL,
  "diseaseId" UUID,
  "allergyTypeId" UUID,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- Micronutrient ----------
CREATE TABLE "micronutrients" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "unit" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- Macronutrient ----------
CREATE TABLE "macronutrients" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "unit" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- Vitamin ----------
CREATE TABLE "vitamins" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "unit" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- Mineral ----------
CREATE TABLE "minerals" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "unit" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- FoodMicronutrient ----------
CREATE TABLE "food_micronutrients" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "foodNutritionId" UUID NOT NULL,
  "micronutrientId" UUID NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- NutritionFact ----------
CREATE TABLE "nutrition_facts" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "source" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- FoodSeason ----------
CREATE TABLE "food_seasons" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "foodId" UUID NOT NULL,
  "season" TEXT NOT NULL,
  "regionId" UUID,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- RegionalFood ----------
CREATE TABLE "regional_foods" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "foodId" UUID NOT NULL,
  "countryId" UUID NOT NULL,
  "localName" TEXT,
  "popularity" INTEGER,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- RecipeCategory ----------
CREATE TABLE "recipe_categories" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- Recipe ----------
CREATE TABLE "recipes" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "categoryId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "prepTimeMinutes" INTEGER NOT NULL,
  "cookTimeMinutes" INTEGER NOT NULL,
  "servings" INTEGER NOT NULL,
  "difficulty" TEXT,
  "status" "ContentStatus" DEFAULT 'DRAFT' NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdBy" UUID,
  "updatedBy" UUID,
  PRIMARY KEY ("id")
);

-- ---------- RecipeIngredient ----------
CREATE TABLE "recipe_ingredients" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "recipeId" UUID NOT NULL,
  "foodId" UUID NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL,
  "unit" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- RecipeStep ----------
CREATE TABLE "recipe_steps" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "recipeId" UUID NOT NULL,
  "stepNumber" INTEGER NOT NULL,
  "instruction" TEXT NOT NULL,
  "durationMinutes" INTEGER,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- RecipeVideo ----------
CREATE TABLE "recipe_videos" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "recipeId" UUID NOT NULL,
  "videoUrl" TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "durationSeconds" INTEGER,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- RecipeNutrition ----------
CREATE TABLE "recipe_nutrition" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "recipeId" UUID NOT NULL UNIQUE,
  "caloriesKcal" DOUBLE PRECISION NOT NULL,
  "proteinG" DOUBLE PRECISION NOT NULL,
  "carbsG" DOUBLE PRECISION NOT NULL,
  "fatG" DOUBLE PRECISION NOT NULL,
  "fiberG" DOUBLE PRECISION,
  "perServing" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- RecipeImage ----------
CREATE TABLE "recipe_images" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "recipeId" UUID NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "isPrimary" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- MealPlan ----------
CREATE TABLE "meal_plans" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "date" DATE NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- Meal ----------
CREATE TABLE "meals" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "mealPlanId" UUID NOT NULL,
  "recipeId" UUID,
  "mealType" "MealType" NOT NULL,
  "scheduledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- MealRecommendation ----------
CREATE TABLE "meal_recommendations" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "mealId" UUID NOT NULL UNIQUE,
  "confidenceScoreId" UUID UNIQUE,
  "safetyValidationId" UUID NOT NULL,
  "generatedByModel" TEXT,
  "status" "RecommendationStatus" DEFAULT 'GENERATED' NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- MealReason ----------
CREATE TABLE "meal_reasons" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "mealRecommendationId" UUID NOT NULL,
  "reasonText" TEXT NOT NULL,
  "nutrientFocus" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- MealAlternative ----------
CREATE TABLE "meal_alternatives" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "mealId" UUID NOT NULL,
  "alternativeRecipeId" UUID NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- MealRestriction ----------
CREATE TABLE "meal_restrictions" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "mealId" UUID NOT NULL,
  "type" "FoodRestrictionType" NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- RecommendationHistory ----------
CREATE TABLE "recommendation_history" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "payload" JSONB NOT NULL,
  "generatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- RecommendationFeedback ----------
CREATE TABLE "recommendation_feedback" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "mealId" UUID NOT NULL,
  "feedback" "FeedbackType" NOT NULL,
  "reason" "FeedbackReason",
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- SafetyValidation ----------
CREATE TABLE "safety_validations" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "result" "SafetyValidationResult" NOT NULL,
  "blockedReason" TEXT,
  "checkedAllergies" BOOLEAN DEFAULT true NOT NULL,
  "checkedMedicines" BOOLEAN DEFAULT true NOT NULL,
  "checkedConditions" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- ConfidenceScore ----------
CREATE TABLE "confidence_scores" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "basis" JSONB,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- MealTracking ----------
CREATE TABLE "meal_tracking" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "mealId" UUID,
  "consumedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "completed" BOOLEAN DEFAULT true NOT NULL,
  "source" "TrackingSource" DEFAULT 'MANUAL' NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- WaterTracking ----------
CREATE TABLE "water_tracking" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "amountMl" INTEGER NOT NULL,
  "loggedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- ExerciseTracking ----------
CREATE TABLE "exercise_tracking" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "activityType" TEXT NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "caloriesBurned" DOUBLE PRECISION,
  "performedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "source" "TrackingSource" DEFAULT 'MANUAL' NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- SleepTracking ----------
CREATE TABLE "sleep_tracking" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "sleepStart" TIMESTAMP(3) NOT NULL,
  "sleepEnd" TIMESTAMP(3) NOT NULL,
  "qualityScore" INTEGER,
  "source" "TrackingSource" DEFAULT 'MANUAL' NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- WeightTracking ----------
CREATE TABLE "weight_tracking" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "weightKg" DOUBLE PRECISION NOT NULL,
  "loggedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- MoodTracking ----------
CREATE TABLE "mood_tracking" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "mood" "MoodLevel" NOT NULL,
  "notes" TEXT,
  "loggedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- SymptomTracking ----------
CREATE TABLE "symptom_tracking" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "symptom" TEXT NOT NULL,
  "severity" "Severity" NOT NULL,
  "loggedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- HabitTracking ----------
CREATE TABLE "habit_tracking" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "habitName" TEXT NOT NULL,
  "streak" INTEGER DEFAULT 0 NOT NULL,
  "lastCompletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- DailySummary ----------
CREATE TABLE "daily_summaries" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "date" DATE NOT NULL,
  "caloriesConsumed" DOUBLE PRECISION,
  "caloriesBurned" DOUBLE PRECISION,
  "waterMl" INTEGER,
  "sleepHours" DOUBLE PRECISION,
  "habitScore" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- WeeklySummary ----------
CREATE TABLE "weekly_summaries" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "weekStartDate" DATE NOT NULL,
  "avgCalories" DOUBLE PRECISION,
  "avgWaterMl" INTEGER,
  "avgSleepHours" DOUBLE PRECISION,
  "habitScoreAvg" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- MonthlySummary ----------
CREATE TABLE "monthly_summaries" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "monthStartDate" DATE NOT NULL,
  "avgCalories" DOUBLE PRECISION,
  "avgWaterMl" INTEGER,
  "avgSleepHours" DOUBLE PRECISION,
  "healthScoreDelta" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- ArticleCategory ----------
CREATE TABLE "article_categories" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- Article ----------
CREATE TABLE "articles" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "categoryId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "status" "ContentStatus" DEFAULT 'DRAFT' NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdBy" UUID,
  "updatedBy" UUID,
  PRIMARY KEY ("id")
);

-- ---------- Video ----------
CREATE TABLE "videos" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "title" TEXT NOT NULL,
  "videoUrl" TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "durationSeconds" INTEGER,
  "status" "ContentStatus" DEFAULT 'DRAFT' NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- HealthTip ----------
CREATE TABLE "health_tips" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- NutritionGuide ----------
CREATE TABLE "nutrition_guides" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- DiseaseGuide ----------
CREATE TABLE "disease_guides" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "diseaseId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- Course ----------
CREATE TABLE "courses" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "ContentStatus" DEFAULT 'DRAFT' NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- Bookmark ----------
CREATE TABLE "bookmarks" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "articleId" UUID,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- LearningProgress ----------
CREATE TABLE "learning_progress" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "courseId" UUID NOT NULL,
  "progressPct" DOUBLE PRECISION DEFAULT 0 NOT NULL,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- StoreCategory ----------
CREATE TABLE "store_categories" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- Store ----------
CREATE TABLE "stores" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "categoryId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "cityId" UUID,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- StoreProduct ----------
CREATE TABLE "store_products" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "storeId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "price" DOUBLE PRECISION,
  "currency" TEXT DEFAULT 'USD' NOT NULL,
  "inStock" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- ShoppingList ----------
CREATE TABLE "shopping_lists" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "name" TEXT DEFAULT 'My Shopping List' NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- ShoppingItem ----------
CREATE TABLE "shopping_items" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "shoppingListId" UUID NOT NULL,
  "foodId" UUID,
  "storeProductId" UUID,
  "name" TEXT NOT NULL,
  "quantity" DOUBLE PRECISION,
  "unit" TEXT,
  "purchased" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- AffiliatePartner ----------
CREATE TABLE "affiliate_partners" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "website" TEXT,
  "commissionPct" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- HealthyRestaurant ----------
CREATE TABLE "healthy_restaurants" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL,
  "cityId" UUID,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- RestaurantMenu ----------
CREATE TABLE "restaurant_menus" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "restaurantId" UUID NOT NULL,
  "itemName" TEXT NOT NULL,
  "caloriesKcal" DOUBLE PRECISION,
  "price" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- OrderHistory ----------
CREATE TABLE "order_history" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "status" "OrderStatus" DEFAULT 'PENDING' NOT NULL,
  "totalAmount" DOUBLE PRECISION,
  "currency" TEXT DEFAULT 'USD' NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- Conversation ----------
CREATE TABLE "conversations" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "title" TEXT,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- Message ----------
CREATE TABLE "messages" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "conversationId" UUID NOT NULL,
  "role" "ConversationRole" NOT NULL,
  "content" TEXT NOT NULL,
  "passedSafetyEngine" BOOLEAN DEFAULT false NOT NULL,
  "passedRuleEngine" BOOLEAN DEFAULT false NOT NULL,
  "passedValidation" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- PromptTemplate ----------
CREATE TABLE "prompt_templates" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "category" "PromptTemplateCategory" NOT NULL,
  "version" INTEGER DEFAULT 1 NOT NULL,
  "templateBody" TEXT NOT NULL,
  "variables" JSONB,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdBy" UUID,
  "updatedBy" UUID,
  PRIMARY KEY ("id")
);

-- ---------- PromptHistory ----------
CREATE TABLE "prompt_history" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "promptTemplateId" UUID NOT NULL,
  "previousBody" TEXT NOT NULL,
  "changedBy" UUID,
  "changeReason" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- KnowledgeArticle ----------
CREATE TABLE "knowledge_articles" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceRef" TEXT,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- Embedding ----------
CREATE TABLE "embeddings" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "knowledgeArticleId" UUID NOT NULL,
  "vectorStoreId" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "dimensions" INTEGER NOT NULL,
  "chunkIndex" INTEGER DEFAULT 0 NOT NULL,
  "chunkText" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- AIFeedback ----------
CREATE TABLE "ai_feedback" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "messageId" UUID,
  "feedback" "FeedbackType" NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- RecommendationLog ----------
CREATE TABLE "recommendation_logs" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "inputSnapshot" JSONB NOT NULL,
  "outputSnapshot" JSONB NOT NULL,
  "safetyEnginePassed" BOOLEAN NOT NULL,
  "ruleEnginePassed" BOOLEAN NOT NULL,
  "validationPassed" BOOLEAN NOT NULL,
  "latencyMs" INTEGER,
  "modelProvider" "AIProvider",
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- AIUsage ----------
CREATE TABLE "ai_usage" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID,
  "provider" "AIProvider" NOT NULL,
  "operation" TEXT NOT NULL,
  "promptTokens" INTEGER,
  "completionTokens" INTEGER,
  "costUsd" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- ModelConfiguration ----------
CREATE TABLE "model_configurations" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "provider" "AIProvider" NOT NULL,
  "modelName" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "isDefault" BOOLEAN DEFAULT false NOT NULL,
  "temperature" DOUBLE PRECISION DEFAULT 0.3,
  "maxTokens" INTEGER,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- Admin ----------
CREATE TABLE "admins" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL UNIQUE,
  "title" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- AuditLog ----------
CREATE TABLE "audit_logs" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "module" TEXT NOT NULL,
  "entityName" TEXT NOT NULL,
  "entityId" UUID NOT NULL,
  "action" TEXT NOT NULL,
  "oldValue" JSONB,
  "newValue" JSONB,
  "performedBy" UUID,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- SystemSetting ----------
CREATE TABLE "system_settings" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "key" TEXT NOT NULL UNIQUE,
  "value" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- FeatureFlag ----------
CREATE TABLE "feature_flags" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "key" TEXT NOT NULL UNIQUE,
  "status" "FeatureFlagStatus" DEFAULT 'DISABLED' NOT NULL,
  "rolloutPct" INTEGER DEFAULT 0,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- PermissionLog ----------
CREATE TABLE "permission_logs" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "permissionCode" TEXT NOT NULL,
  "granted" BOOLEAN NOT NULL,
  "performedBy" UUID,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- ErrorLog ----------
CREATE TABLE "error_logs" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "service" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "stackTrace" TEXT,
  "severity" "Severity" DEFAULT 'MEDIUM' NOT NULL,
  "resolved" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- Analytics ----------
CREATE TABLE "analytics" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "metric" TEXT NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "dimensions" JSONB,
  "recordedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- NotificationQueue ----------
CREATE TABLE "notification_queue" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" "NotificationStatus" DEFAULT 'QUEUED' NOT NULL,
  "scheduledFor" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- Announcement ----------
CREATE TABLE "announcements" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" "ContentStatus" DEFAULT 'DRAFT' NOT NULL,
  "publishAt" TIMESTAMP(3),
  "expireAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP(3),
  PRIMARY KEY ("id")
);

-- ---------- SupportTicket ----------
CREATE TABLE "support_tickets" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "userId" UUID NOT NULL,
  "subject" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "SupportTicketStatus" DEFAULT 'OPEN' NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- Country ----------
CREATE TABLE "countries" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "isoCode" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- State ----------
CREATE TABLE "states" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "countryId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- City ----------
CREATE TABLE "cities" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "stateId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- Language ----------
CREATE TABLE "languages" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "code" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- Religion ----------
CREATE TABLE "religions" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- SubscriptionPlan ----------
CREATE TABLE "subscription_plans" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "type" "SubscriptionPlanType" NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "priceUsd" DOUBLE PRECISION NOT NULL,
  "billingPeriod" TEXT NOT NULL,
  "features" JSONB,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

-- ---------- INDEXES ----------
CREATE INDEX "idx_users_email" ON "users" ("email");
CREATE INDEX "idx_users_createdAt" ON "users" ("createdAt");
CREATE INDEX "idx_users_status" ON "users" ("status");
CREATE UNIQUE INDEX "uq_role_permissions_roleId_permissionId" ON "role_permissions" ("roleId", "permissionId");
CREATE UNIQUE INDEX "uq_user_roles_userId_roleId" ON "user_roles" ("userId", "roleId");
CREATE INDEX "idx_user_roles_userId" ON "user_roles" ("userId");
CREATE INDEX "idx_sessions_userId" ON "sessions" ("userId");
CREATE INDEX "idx_sessions_expiresAt" ON "sessions" ("expiresAt");
CREATE INDEX "idx_refresh_tokens_userId" ON "refresh_tokens" ("userId");
CREATE INDEX "idx_devices_userId" ON "devices" ("userId");
CREATE INDEX "idx_login_history_userId_createdAt" ON "login_history" ("userId", "createdAt");
CREATE INDEX "idx_password_resets_userId" ON "password_resets" ("userId");
CREATE INDEX "idx_user_profiles_userId" ON "user_profiles" ("userId");
CREATE INDEX "idx_addresses_userId" ON "addresses" ("userId");
CREATE INDEX "idx_emergency_contacts_userId" ON "emergency_contacts" ("userId");
CREATE INDEX "idx_subscriptions_userId" ON "subscriptions" ("userId");
CREATE INDEX "idx_subscriptions_status" ON "subscriptions" ("status");
CREATE INDEX "idx_health_profiles_userId" ON "health_profiles" ("userId");
CREATE INDEX "idx_body_measurements_userId_measuredAt" ON "body_measurements" ("userId", "measuredAt");
CREATE INDEX "idx_bmi_history_userId_recordedAt" ON "bmi_history" ("userId", "recordedAt");
CREATE INDEX "idx_health_goals_userId" ON "health_goals" ("userId");
CREATE UNIQUE INDEX "uq_daily_lifestyles_userId_date" ON "daily_lifestyles" ("userId", "date");
CREATE INDEX "idx_daily_lifestyles_userId_date" ON "daily_lifestyles" ("userId", "date");
CREATE INDEX "idx_vitals_userId_recordedAt" ON "vitals" ("userId", "recordedAt");
CREATE INDEX "idx_health_scores_userId_calculatedAt" ON "health_scores" ("userId", "calculatedAt");
CREATE INDEX "idx_diseases_name" ON "diseases" ("name");
CREATE INDEX "idx_medical_conditions_userId" ON "medical_conditions" ("userId");
CREATE INDEX "idx_medical_conditions_diseaseId" ON "medical_conditions" ("diseaseId");
CREATE INDEX "idx_medicines_userId" ON "medicines" ("userId");
CREATE INDEX "idx_medicines_userId_isActive" ON "medicines" ("userId", "isActive");
CREATE INDEX "idx_medicine_schedules_medicineId_scheduledAt" ON "medicine_schedules" ("medicineId", "scheduledAt");
CREATE INDEX "idx_allergies_userId" ON "allergies" ("userId");
CREATE INDEX "idx_allergies_allergyTypeId" ON "allergies" ("allergyTypeId");
CREATE INDEX "idx_medical_reports_userId_reportDate" ON "medical_reports" ("userId", "reportDate");
CREATE INDEX "idx_medical_report_files_medicalReportId" ON "medical_report_files" ("medicalReportId");
CREATE INDEX "idx_lab_results_medicalReportId" ON "lab_results" ("medicalReportId");
CREATE INDEX "idx_ocr_results_medicalReportId" ON "ocr_results" ("medicalReportId");
CREATE INDEX "idx_ocr_results_status" ON "ocr_results" ("status");
CREATE INDEX "idx_family_history_userId" ON "family_history" ("userId");
CREATE INDEX "idx_symptom_history_userId_notedAt" ON "symptom_history" ("userId", "notedAt");
CREATE INDEX "idx_foods_name" ON "foods" ("name");
CREATE INDEX "idx_foods_categoryId" ON "foods" ("categoryId");
CREATE INDEX "idx_food_servings_foodId" ON "food_servings" ("foodId");
CREATE INDEX "idx_food_restrictions_foodId" ON "food_restrictions" ("foodId");
CREATE UNIQUE INDEX "uq_food_micronutrients_foodNutritionId_micronutrientId" ON "food_micronutrients" ("foodNutritionId", "micronutrientId");
CREATE INDEX "idx_food_seasons_foodId" ON "food_seasons" ("foodId");
CREATE INDEX "idx_regional_foods_foodId" ON "regional_foods" ("foodId");
CREATE INDEX "idx_regional_foods_countryId" ON "regional_foods" ("countryId");
CREATE INDEX "idx_recipes_title" ON "recipes" ("title");
CREATE INDEX "idx_recipes_categoryId" ON "recipes" ("categoryId");
CREATE INDEX "idx_recipe_ingredients_recipeId" ON "recipe_ingredients" ("recipeId");
CREATE UNIQUE INDEX "uq_recipe_steps_recipeId_stepNumber" ON "recipe_steps" ("recipeId", "stepNumber");
CREATE INDEX "idx_recipe_videos_recipeId" ON "recipe_videos" ("recipeId");
CREATE INDEX "idx_recipe_images_recipeId" ON "recipe_images" ("recipeId");
CREATE UNIQUE INDEX "uq_meal_plans_userId_date" ON "meal_plans" ("userId", "date");
CREATE INDEX "idx_meal_plans_userId_date" ON "meal_plans" ("userId", "date");
CREATE INDEX "idx_meals_mealPlanId" ON "meals" ("mealPlanId");
CREATE INDEX "idx_meals_mealType" ON "meals" ("mealType");
CREATE INDEX "idx_meal_recommendations_status" ON "meal_recommendations" ("status");
CREATE INDEX "idx_meal_reasons_mealRecommendationId" ON "meal_reasons" ("mealRecommendationId");
CREATE INDEX "idx_meal_alternatives_mealId" ON "meal_alternatives" ("mealId");
CREATE INDEX "idx_meal_restrictions_mealId" ON "meal_restrictions" ("mealId");
CREATE INDEX "idx_recommendation_history_userId_generatedAt" ON "recommendation_history" ("userId", "generatedAt");
CREATE INDEX "idx_recommendation_feedback_userId" ON "recommendation_feedback" ("userId");
CREATE INDEX "idx_recommendation_feedback_mealId" ON "recommendation_feedback" ("mealId");
CREATE INDEX "idx_safety_validations_userId" ON "safety_validations" ("userId");
CREATE INDEX "idx_safety_validations_result" ON "safety_validations" ("result");
CREATE INDEX "idx_meal_tracking_userId_consumedAt" ON "meal_tracking" ("userId", "consumedAt");
CREATE INDEX "idx_water_tracking_userId_loggedAt" ON "water_tracking" ("userId", "loggedAt");
CREATE INDEX "idx_exercise_tracking_userId_performedAt" ON "exercise_tracking" ("userId", "performedAt");
CREATE INDEX "idx_sleep_tracking_userId_sleepStart" ON "sleep_tracking" ("userId", "sleepStart");
CREATE INDEX "idx_weight_tracking_userId_loggedAt" ON "weight_tracking" ("userId", "loggedAt");
CREATE INDEX "idx_mood_tracking_userId_loggedAt" ON "mood_tracking" ("userId", "loggedAt");
CREATE INDEX "idx_symptom_tracking_userId_loggedAt" ON "symptom_tracking" ("userId", "loggedAt");
CREATE INDEX "idx_habit_tracking_userId" ON "habit_tracking" ("userId");
CREATE UNIQUE INDEX "uq_daily_summaries_userId_date" ON "daily_summaries" ("userId", "date");
CREATE INDEX "idx_daily_summaries_userId_date" ON "daily_summaries" ("userId", "date");
CREATE UNIQUE INDEX "uq_weekly_summaries_userId_weekStartDate" ON "weekly_summaries" ("userId", "weekStartDate");
CREATE INDEX "idx_weekly_summaries_userId_weekStartDate" ON "weekly_summaries" ("userId", "weekStartDate");
CREATE UNIQUE INDEX "uq_monthly_summaries_userId_monthStartDate" ON "monthly_summaries" ("userId", "monthStartDate");
CREATE INDEX "idx_monthly_summaries_userId_monthStartDate" ON "monthly_summaries" ("userId", "monthStartDate");
CREATE INDEX "idx_articles_title" ON "articles" ("title");
CREATE INDEX "idx_articles_status" ON "articles" ("status");
CREATE INDEX "idx_disease_guides_diseaseId" ON "disease_guides" ("diseaseId");
CREATE UNIQUE INDEX "uq_bookmarks_userId_articleId" ON "bookmarks" ("userId", "articleId");
CREATE INDEX "idx_bookmarks_userId" ON "bookmarks" ("userId");
CREATE UNIQUE INDEX "uq_learning_progress_userId_courseId" ON "learning_progress" ("userId", "courseId");
CREATE INDEX "idx_learning_progress_userId" ON "learning_progress" ("userId");
CREATE INDEX "idx_stores_cityId" ON "stores" ("cityId");
CREATE INDEX "idx_store_products_storeId" ON "store_products" ("storeId");
CREATE INDEX "idx_shopping_lists_userId" ON "shopping_lists" ("userId");
CREATE INDEX "idx_shopping_items_shoppingListId" ON "shopping_items" ("shoppingListId");
CREATE INDEX "idx_healthy_restaurants_cityId" ON "healthy_restaurants" ("cityId");
CREATE INDEX "idx_restaurant_menus_restaurantId" ON "restaurant_menus" ("restaurantId");
CREATE INDEX "idx_order_history_userId" ON "order_history" ("userId");
CREATE INDEX "idx_conversations_userId" ON "conversations" ("userId");
CREATE INDEX "idx_messages_conversationId_createdAt" ON "messages" ("conversationId", "createdAt");
CREATE INDEX "idx_prompt_templates_category" ON "prompt_templates" ("category");
CREATE INDEX "idx_prompt_templates_name_version" ON "prompt_templates" ("name", "version");
CREATE INDEX "idx_prompt_history_promptTemplateId" ON "prompt_history" ("promptTemplateId");
CREATE INDEX "idx_knowledge_articles_sourceType" ON "knowledge_articles" ("sourceType");
CREATE INDEX "idx_embeddings_knowledgeArticleId" ON "embeddings" ("knowledgeArticleId");
CREATE INDEX "idx_embeddings_vectorStoreId" ON "embeddings" ("vectorStoreId");
CREATE INDEX "idx_ai_feedback_userId" ON "ai_feedback" ("userId");
CREATE INDEX "idx_recommendation_logs_userId_createdAt" ON "recommendation_logs" ("userId", "createdAt");
CREATE INDEX "idx_ai_usage_userId_createdAt" ON "ai_usage" ("userId", "createdAt");
CREATE INDEX "idx_ai_usage_operation" ON "ai_usage" ("operation");
CREATE UNIQUE INDEX "uq_model_configurations_provider_modelName_purpose" ON "model_configurations" ("provider", "modelName", "purpose");
CREATE INDEX "idx_audit_logs_entityName_entityId" ON "audit_logs" ("entityName", "entityId");
CREATE INDEX "idx_audit_logs_performedBy" ON "audit_logs" ("performedBy");
CREATE INDEX "idx_permission_logs_userId" ON "permission_logs" ("userId");
CREATE INDEX "idx_error_logs_service_createdAt" ON "error_logs" ("service", "createdAt");
CREATE INDEX "idx_error_logs_severity" ON "error_logs" ("severity");
CREATE INDEX "idx_analytics_metric_recordedAt" ON "analytics" ("metric", "recordedAt");
CREATE INDEX "idx_notification_queue_userId_status" ON "notification_queue" ("userId", "status");
CREATE INDEX "idx_support_tickets_userId_status" ON "support_tickets" ("userId", "status");
CREATE UNIQUE INDEX "uq_states_countryId_name" ON "states" ("countryId", "name");
CREATE UNIQUE INDEX "uq_cities_stateId_name" ON "cities" ("stateId", "name");

-- ---------- FOREIGN KEYS ----------
ALTER TABLE "role_permissions" ADD CONSTRAINT "fk_role_permissions_roleId" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "fk_role_permissions_permissionId" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_roleId" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "fk_sessions_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "fk_refresh_tokens_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "devices" ADD CONSTRAINT "fk_devices_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "login_history" ADD CONSTRAINT "fk_login_history_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "password_resets" ADD CONSTRAINT "fk_password_resets_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_profiles" ADD CONSTRAINT "fk_user_profiles_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_profiles" ADD CONSTRAINT "fk_user_profiles_countryId" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_profiles" ADD CONSTRAINT "fk_user_profiles_stateId" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_profiles" ADD CONSTRAINT "fk_user_profiles_cityId" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_profiles" ADD CONSTRAINT "fk_user_profiles_religionId" FOREIGN KEY ("religionId") REFERENCES "religions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "addresses" ADD CONSTRAINT "fk_addresses_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "addresses" ADD CONSTRAINT "fk_addresses_cityId" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "addresses" ADD CONSTRAINT "fk_addresses_stateId" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "addresses" ADD CONSTRAINT "fk_addresses_countryId" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "fk_emergency_contacts_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "language_preferences" ADD CONSTRAINT "fk_language_preferences_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "language_preferences" ADD CONSTRAINT "fk_language_preferences_primaryLanguageId" FOREIGN KEY ("primaryLanguageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "language_preferences" ADD CONSTRAINT "fk_language_preferences_secondaryLanguageId" FOREIGN KEY ("secondaryLanguageId") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notification_preferences" ADD CONSTRAINT "fk_notification_preferences_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "fk_subscriptions_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "fk_subscriptions_planId" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_settings" ADD CONSTRAINT "fk_user_settings_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "health_profiles" ADD CONSTRAINT "fk_health_profiles_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "body_measurements" ADD CONSTRAINT "fk_body_measurements_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bmi_history" ADD CONSTRAINT "fk_bmi_history_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "health_goals" ADD CONSTRAINT "fk_health_goals_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lifestyles" ADD CONSTRAINT "fk_lifestyles_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "daily_lifestyles" ADD CONSTRAINT "fk_daily_lifestyles_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vitals" ADD CONSTRAINT "fk_vitals_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "health_scores" ADD CONSTRAINT "fk_health_scores_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "diseases" ADD CONSTRAINT "fk_diseases_categoryId" FOREIGN KEY ("categoryId") REFERENCES "disease_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "medical_conditions" ADD CONSTRAINT "fk_medical_conditions_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "medical_conditions" ADD CONSTRAINT "fk_medical_conditions_diseaseId" FOREIGN KEY ("diseaseId") REFERENCES "diseases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "medicines" ADD CONSTRAINT "fk_medicines_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "medicine_schedules" ADD CONSTRAINT "fk_medicine_schedules_medicineId" FOREIGN KEY ("medicineId") REFERENCES "medicines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "allergies" ADD CONSTRAINT "fk_allergies_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "allergies" ADD CONSTRAINT "fk_allergies_allergyTypeId" FOREIGN KEY ("allergyTypeId") REFERENCES "allergy_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "medical_reports" ADD CONSTRAINT "fk_medical_reports_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "medical_report_files" ADD CONSTRAINT "fk_medical_report_files_medicalReportId" FOREIGN KEY ("medicalReportId") REFERENCES "medical_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lab_results" ADD CONSTRAINT "fk_lab_results_medicalReportId" FOREIGN KEY ("medicalReportId") REFERENCES "medical_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ocr_results" ADD CONSTRAINT "fk_ocr_results_medicalReportId" FOREIGN KEY ("medicalReportId") REFERENCES "medical_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "family_history" ADD CONSTRAINT "fk_family_history_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "symptom_history" ADD CONSTRAINT "fk_symptom_history_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "foods" ADD CONSTRAINT "fk_foods_categoryId" FOREIGN KEY ("categoryId") REFERENCES "food_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "food_nutrition" ADD CONSTRAINT "fk_food_nutrition_foodId" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "food_servings" ADD CONSTRAINT "fk_food_servings_foodId" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "food_restrictions" ADD CONSTRAINT "fk_food_restrictions_foodId" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "food_restrictions" ADD CONSTRAINT "fk_food_restrictions_diseaseId" FOREIGN KEY ("diseaseId") REFERENCES "diseases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "food_micronutrients" ADD CONSTRAINT "fk_food_micronutrients_foodNutritionId" FOREIGN KEY ("foodNutritionId") REFERENCES "food_nutrition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "food_micronutrients" ADD CONSTRAINT "fk_food_micronutrients_micronutrientId" FOREIGN KEY ("micronutrientId") REFERENCES "micronutrients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "food_seasons" ADD CONSTRAINT "fk_food_seasons_foodId" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "regional_foods" ADD CONSTRAINT "fk_regional_foods_foodId" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "regional_foods" ADD CONSTRAINT "fk_regional_foods_countryId" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recipes" ADD CONSTRAINT "fk_recipes_categoryId" FOREIGN KEY ("categoryId") REFERENCES "recipe_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "fk_recipe_ingredients_recipeId" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "fk_recipe_ingredients_foodId" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recipe_steps" ADD CONSTRAINT "fk_recipe_steps_recipeId" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recipe_videos" ADD CONSTRAINT "fk_recipe_videos_recipeId" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recipe_nutrition" ADD CONSTRAINT "fk_recipe_nutrition_recipeId" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recipe_images" ADD CONSTRAINT "fk_recipe_images_recipeId" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meal_plans" ADD CONSTRAINT "fk_meal_plans_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "meals" ADD CONSTRAINT "fk_meals_mealPlanId" FOREIGN KEY ("mealPlanId") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meals" ADD CONSTRAINT "fk_meals_recipeId" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "meal_recommendations" ADD CONSTRAINT "fk_meal_recommendations_mealId" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meal_recommendations" ADD CONSTRAINT "fk_meal_recommendations_confidenceScoreId" FOREIGN KEY ("confidenceScoreId") REFERENCES "confidence_scores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "meal_recommendations" ADD CONSTRAINT "fk_meal_recommendations_safetyValidationId" FOREIGN KEY ("safetyValidationId") REFERENCES "safety_validations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "meal_reasons" ADD CONSTRAINT "fk_meal_reasons_mealRecommendationId" FOREIGN KEY ("mealRecommendationId") REFERENCES "meal_recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meal_alternatives" ADD CONSTRAINT "fk_meal_alternatives_mealId" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meal_restrictions" ADD CONSTRAINT "fk_meal_restrictions_mealId" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recommendation_history" ADD CONSTRAINT "fk_recommendation_history_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recommendation_feedback" ADD CONSTRAINT "fk_recommendation_feedback_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "meal_tracking" ADD CONSTRAINT "fk_meal_tracking_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "meal_tracking" ADD CONSTRAINT "fk_meal_tracking_mealId" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "water_tracking" ADD CONSTRAINT "fk_water_tracking_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "exercise_tracking" ADD CONSTRAINT "fk_exercise_tracking_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sleep_tracking" ADD CONSTRAINT "fk_sleep_tracking_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "weight_tracking" ADD CONSTRAINT "fk_weight_tracking_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mood_tracking" ADD CONSTRAINT "fk_mood_tracking_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "symptom_tracking" ADD CONSTRAINT "fk_symptom_tracking_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "habit_tracking" ADD CONSTRAINT "fk_habit_tracking_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "daily_summaries" ADD CONSTRAINT "fk_daily_summaries_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "weekly_summaries" ADD CONSTRAINT "fk_weekly_summaries_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "monthly_summaries" ADD CONSTRAINT "fk_monthly_summaries_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "articles" ADD CONSTRAINT "fk_articles_categoryId" FOREIGN KEY ("categoryId") REFERENCES "article_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookmarks" ADD CONSTRAINT "fk_bookmarks_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookmarks" ADD CONSTRAINT "fk_bookmarks_articleId" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_progress" ADD CONSTRAINT "fk_learning_progress_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_progress" ADD CONSTRAINT "fk_learning_progress_courseId" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stores" ADD CONSTRAINT "fk_stores_categoryId" FOREIGN KEY ("categoryId") REFERENCES "store_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stores" ADD CONSTRAINT "fk_stores_cityId" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "store_products" ADD CONSTRAINT "fk_store_products_storeId" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shopping_lists" ADD CONSTRAINT "fk_shopping_lists_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shopping_items" ADD CONSTRAINT "fk_shopping_items_shoppingListId" FOREIGN KEY ("shoppingListId") REFERENCES "shopping_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shopping_items" ADD CONSTRAINT "fk_shopping_items_storeProductId" FOREIGN KEY ("storeProductId") REFERENCES "store_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "healthy_restaurants" ADD CONSTRAINT "fk_healthy_restaurants_cityId" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "restaurant_menus" ADD CONSTRAINT "fk_restaurant_menus_restaurantId" FOREIGN KEY ("restaurantId") REFERENCES "healthy_restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_history" ADD CONSTRAINT "fk_order_history_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "fk_conversations_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "fk_messages_conversationId" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prompt_history" ADD CONSTRAINT "fk_prompt_history_promptTemplateId" FOREIGN KEY ("promptTemplateId") REFERENCES "prompt_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "embeddings" ADD CONSTRAINT "fk_embeddings_knowledgeArticleId" FOREIGN KEY ("knowledgeArticleId") REFERENCES "knowledge_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_feedback" ADD CONSTRAINT "fk_ai_feedback_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_usage" ADD CONSTRAINT "fk_ai_usage_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "support_tickets" ADD CONSTRAINT "fk_support_tickets_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "states" ADD CONSTRAINT "fk_states_countryId" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cities" ADD CONSTRAINT "fk_cities_stateId" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

