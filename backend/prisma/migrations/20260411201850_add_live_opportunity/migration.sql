-- DropForeignKey
ALTER TABLE "DigestEmail" DROP CONSTRAINT "DigestEmail_customerId_fkey";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
ADD COLUMN     "trialStartedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DigestLog" (
    "id" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "meta" JSONB,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DigestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveOpportunity" (
    "id" SERIAL NOT NULL,
    "segment" "OpportunitySegment" NOT NULL DEFAULT 'government',
    "source" TEXT NOT NULL,
    "externalId" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "buyer" TEXT,
    "location" TEXT,
    "state" TEXT,
    "naics" TEXT,
    "category" TEXT,
    "status" TEXT,
    "noticeType" TEXT,
    "summaryShort" TEXT,
    "summaryLong" TEXT,
    "postedDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DigestLog_key_key" ON "DigestLog"("key");

-- CreateIndex
CREATE INDEX "DigestLog_customerId_type_sentAt_idx" ON "DigestLog"("customerId", "type", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "LiveOpportunity_slug_key" ON "LiveOpportunity"("slug");

-- CreateIndex
CREATE INDEX "LiveOpportunity_segment_idx" ON "LiveOpportunity"("segment");

-- CreateIndex
CREATE INDEX "LiveOpportunity_source_idx" ON "LiveOpportunity"("source");

-- CreateIndex
CREATE INDEX "LiveOpportunity_state_idx" ON "LiveOpportunity"("state");

-- CreateIndex
CREATE INDEX "LiveOpportunity_category_idx" ON "LiveOpportunity"("category");

-- CreateIndex
CREATE INDEX "LiveOpportunity_dueDate_idx" ON "LiveOpportunity"("dueDate");

-- CreateIndex
CREATE INDEX "LiveOpportunity_isActive_idx" ON "LiveOpportunity"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LiveOpportunity_source_externalId_key" ON "LiveOpportunity"("source", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveOpportunity_source_sourceUrl_key" ON "LiveOpportunity"("source", "sourceUrl");

-- AddForeignKey
ALTER TABLE "DigestLog" ADD CONSTRAINT "DigestLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigestEmail" ADD CONSTRAINT "DigestEmail_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
