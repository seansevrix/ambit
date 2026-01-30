-- CreateTable
CREATE TABLE "DigestEmail" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "digestDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "resendId" TEXT,
    "error" TEXT,
    "matchKey" TEXT,
    "matchTitle" TEXT,
    "matchUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigestEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DigestEmail_customerId_matchKey_idx" ON "DigestEmail"("customerId", "matchKey");

-- CreateIndex
CREATE UNIQUE INDEX "DigestEmail_customerId_digestDate_key" ON "DigestEmail"("customerId", "digestDate");

-- AddForeignKey
ALTER TABLE "DigestEmail" ADD CONSTRAINT "DigestEmail_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
