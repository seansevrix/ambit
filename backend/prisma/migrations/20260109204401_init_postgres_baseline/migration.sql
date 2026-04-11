-- Fully replay-safe Postgres baseline bridge.
-- Ensures enum, core tables, indexes, and FKs exist without assuming
-- earlier legacy migrations succeeded in a specific order.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'OpportunitySegment'
  ) THEN
    CREATE TYPE "OpportunitySegment" AS ENUM ('government', 'commercial', 'residential');
  END IF;
END
$$;

-- Create Customer if missing
CREATE TABLE IF NOT EXISTS "Customer" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT,
  "phone" TEXT,
  "industry" TEXT,
  "location" TEXT,
  "serviceArea" TEXT,
  "services" TEXT,
  "segments" "OpportunitySegment"[],
  "sources" TEXT[],
  "keywords" TEXT,
  "naics" TEXT,
  "naicsCodes" TEXT[],
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "subscriptionStatus" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "digestEnabled" BOOLEAN NOT NULL DEFAULT true,
  "lastDigestSentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- Create Opportunity if missing
CREATE TABLE IF NOT EXISTS "Opportunity" (
  "id" SERIAL NOT NULL,
  "segment" "OpportunitySegment" NOT NULL DEFAULT 'government',
  "source" TEXT NOT NULL DEFAULT 'sam',
  "externalId" TEXT,
  "url" TEXT,
  "title" TEXT NOT NULL,
  "location" TEXT NOT NULL DEFAULT '',
  "naics" TEXT NOT NULL DEFAULT '',
  "keywords" TEXT,
  "agency" TEXT,
  "postedDate" TIMESTAMP(3),
  "dueDate" TIMESTAMP(3),
  "summary" TEXT,
  "category" TEXT,
  "valueText" TEXT,
  "status" TEXT,
  "raw" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- Add missing columns to Customer
ALTER TABLE "Customer"
ADD COLUMN IF NOT EXISTS "passwordHash" TEXT,
ADD COLUMN IF NOT EXISTS "serviceArea" TEXT,
ADD COLUMN IF NOT EXISTS "segments" "OpportunitySegment"[],
ADD COLUMN IF NOT EXISTS "sources" TEXT[],
ADD COLUMN IF NOT EXISTS "keywords" TEXT,
ADD COLUMN IF NOT EXISTS "naics" TEXT,
ADD COLUMN IF NOT EXISTS "naicsCodes" TEXT[],
ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT,
ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "digestEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "lastDigestSentAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Add missing columns to Opportunity
ALTER TABLE "Opportunity"
ADD COLUMN IF NOT EXISTS "segment" "OpportunitySegment" NOT NULL DEFAULT 'government',
ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'sam',
ADD COLUMN IF NOT EXISTS "externalId" TEXT,
ADD COLUMN IF NOT EXISTS "url" TEXT,
ADD COLUMN IF NOT EXISTS "keywords" TEXT,
ADD COLUMN IF NOT EXISTS "agency" TEXT,
ADD COLUMN IF NOT EXISTS "postedDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "dueDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "summary" TEXT,
ADD COLUMN IF NOT EXISTS "category" TEXT,
ADD COLUMN IF NOT EXISTS "valueText" TEXT,
ADD COLUMN IF NOT EXISTS "status" TEXT,
ADD COLUMN IF NOT EXISTS "raw" JSONB,
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Backfill and defaults for Opportunity
UPDATE "Opportunity"
SET "location" = ''
WHERE "location" IS NULL;

UPDATE "Opportunity"
SET "naics" = ''
WHERE "naics" IS NULL;

ALTER TABLE "Opportunity"
ALTER COLUMN "segment" SET DEFAULT 'government',
ALTER COLUMN "source" SET DEFAULT 'sam',
ALTER COLUMN "naics" SET DEFAULT '',
ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "naics" SET NOT NULL;

-- Supporting tables
CREATE TABLE IF NOT EXISTS "ThumbtackIntegration" (
  "id" SERIAL NOT NULL,
  "customerId" INTEGER NOT NULL,
  "businessId" TEXT,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "tokenType" TEXT,
  "scope" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ThumbtackIntegration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ThumbtackWebhookEvent" (
  "id" SERIAL NOT NULL,
  "customerId" INTEGER,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "eventType" TEXT NOT NULL,
  "externalId" TEXT,
  "payload" JSONB NOT NULL,
  "processed" BOOLEAN NOT NULL DEFAULT false,
  "processedAt" TIMESTAMP(3),
  "error" TEXT,
  "opportunityId" INTEGER,
  CONSTRAINT "ThumbtackWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_email_key" ON "Customer"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_stripeCustomerId_key" ON "Customer"("stripeCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_stripeSubscriptionId_key" ON "Customer"("stripeSubscriptionId");

CREATE INDEX IF NOT EXISTS "Opportunity_segment_idx" ON "Opportunity"("segment");
CREATE INDEX IF NOT EXISTS "Opportunity_source_idx" ON "Opportunity"("source");
CREATE UNIQUE INDEX IF NOT EXISTS "Opportunity_source_externalId_key" ON "Opportunity"("source", "externalId");

CREATE UNIQUE INDEX IF NOT EXISTS "ThumbtackIntegration_customerId_key" ON "ThumbtackIntegration"("customerId");

CREATE INDEX IF NOT EXISTS "ThumbtackWebhookEvent_receivedAt_idx" ON "ThumbtackWebhookEvent"("receivedAt");
CREATE INDEX IF NOT EXISTS "ThumbtackWebhookEvent_eventType_idx" ON "ThumbtackWebhookEvent"("eventType");
CREATE INDEX IF NOT EXISTS "ThumbtackWebhookEvent_externalId_idx" ON "ThumbtackWebhookEvent"("externalId");
CREATE INDEX IF NOT EXISTS "ThumbtackWebhookEvent_processed_idx" ON "ThumbtackWebhookEvent"("processed");

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ThumbtackIntegration_customerId_fkey'
  ) THEN
    ALTER TABLE "ThumbtackIntegration"
    ADD CONSTRAINT "ThumbtackIntegration_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ThumbtackWebhookEvent_customerId_fkey'
  ) THEN
    ALTER TABLE "ThumbtackWebhookEvent"
    ADD CONSTRAINT "ThumbtackWebhookEvent_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ThumbtackWebhookEvent_opportunityId_fkey'
  ) THEN
    ALTER TABLE "ThumbtackWebhookEvent"
    ADD CONSTRAINT "ThumbtackWebhookEvent_opportunityId_fkey"
    FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;