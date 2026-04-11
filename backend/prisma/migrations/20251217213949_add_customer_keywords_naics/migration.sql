-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "industry" TEXT,
    "location" TEXT,
    "services" TEXT,
    "keywords" TEXT,
    "naics" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "naics" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_stripeCustomerId_key" ON "Customer"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_stripeSubscriptionId_key" ON "Customer"("stripeSubscriptionId");