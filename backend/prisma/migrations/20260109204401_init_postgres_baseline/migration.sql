-- CreateEnum
CREATE TYPE "OpportunitySegment" AS ENUM ('government', 'commercial', 'residential');

-- CreateTable
CREATE TABLE "Customer" (
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

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" SERIAL NOT NULL,
    "segment" "OpportunitySegment" NOT NULL DEFAULT 'government',
    "source" TEXT NOT NULL DEFAULT 'sam',
    "externalId" TEXT,
    "url" TEXT,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "ThumbtackIntegration" (
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

-- CreateTable
CREATE TABLE "ThumbtackWebhookEvent" (
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

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_stripeCustomerId_key" ON "Customer"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_stripeSubscriptionId_key" ON "Customer"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Opportunity_segment_idx" ON "Opportunity"("segment");

-- CreateIndex
CREATE INDEX "Opportunity_source_idx" ON "Opportunity"("source");

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_source_externalId_key" ON "Opportunity"("source", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "ThumbtackIntegration_customerId_key" ON "ThumbtackIntegration"("customerId");

-- CreateIndex
CREATE INDEX "ThumbtackWebhookEvent_receivedAt_idx" ON "ThumbtackWebhookEvent"("receivedAt");

-- CreateIndex
CREATE INDEX "ThumbtackWebhookEvent_eventType_idx" ON "ThumbtackWebhookEvent"("eventType");

-- CreateIndex
CREATE INDEX "ThumbtackWebhookEvent_externalId_idx" ON "ThumbtackWebhookEvent"("externalId");

-- CreateIndex
CREATE INDEX "ThumbtackWebhookEvent_processed_idx" ON "ThumbtackWebhookEvent"("processed");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ThumbtackIntegration" ADD CONSTRAINT "ThumbtackIntegration_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThumbtackWebhookEvent" ADD CONSTRAINT "ThumbtackWebhookEvent_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThumbtackWebhookEvent" ADD CONSTRAINT "ThumbtackWebhookEvent_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
