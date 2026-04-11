/*
  Postgres-safe, replay-safe rewrite of the old SQLite migration.
  Adds metadata columns to Opportunity only if they do not already exist,
  backfills NULLs, and then makes location + naics required.
*/

ALTER TABLE "Opportunity"
ADD COLUMN IF NOT EXISTS "keywords" TEXT,
ADD COLUMN IF NOT EXISTS "agency" TEXT,
ADD COLUMN IF NOT EXISTS "url" TEXT,
ADD COLUMN IF NOT EXISTS "postedDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "summary" TEXT;

UPDATE "Opportunity"
SET "location" = ''
WHERE "location" IS NULL;

UPDATE "Opportunity"
SET "naics" = ''
WHERE "naics" IS NULL;

ALTER TABLE "Opportunity"
ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "naics" SET NOT NULL;