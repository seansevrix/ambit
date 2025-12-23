/*
  Warnings:

  - Made the column `location` on table `Opportunity` required. This step will fail if there are existing NULL values in that column.
  - Made the column `naics` on table `Opportunity` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Opportunity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "naics" TEXT NOT NULL,
    "keywords" TEXT,
    "agency" TEXT,
    "url" TEXT,
    "postedDate" DATETIME,
    "summary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Opportunity" ("createdAt", "id", "keywords", "location", "naics", "title", "updatedAt") SELECT "createdAt", "id", "keywords", "location", "naics", "title", "updatedAt" FROM "Opportunity";
DROP TABLE "Opportunity";
ALTER TABLE "new_Opportunity" RENAME TO "Opportunity";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
