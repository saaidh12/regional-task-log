/*
  Warnings:

  - You are about to drop the column `atoll` on the `YaumiyyaRecord` table. All the data in the column will be lost.
  - You are about to drop the column `island` on the `YaumiyyaRecord` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_YaumiyyaRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "startTime" TEXT,
    "finishedTime" TEXT,
    "region" TEXT NOT NULL,
    "meetingTitle" TEXT,
    "meetingNotes" TEXT NOT NULL,
    "assignedTasks" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdByServiceNumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "YaumiyyaRecord_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_YaumiyyaRecord" ("assignedTasks", "createdAt", "createdByName", "createdByServiceNumber", "createdByUserId", "date", "id", "meetingNotes", "meetingTitle", "region", "updatedAt") SELECT "assignedTasks", "createdAt", "createdByName", "createdByServiceNumber", "createdByUserId", "date", "id", "meetingNotes", "meetingTitle", "region", "updatedAt" FROM "YaumiyyaRecord";
DROP TABLE "YaumiyyaRecord";
ALTER TABLE "new_YaumiyyaRecord" RENAME TO "YaumiyyaRecord";
CREATE INDEX "YaumiyyaRecord_region_idx" ON "YaumiyyaRecord"("region");
CREATE INDEX "YaumiyyaRecord_date_idx" ON "YaumiyyaRecord"("date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
