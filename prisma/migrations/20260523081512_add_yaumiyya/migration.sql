-- CreateTable
CREATE TABLE "YaumiyyaRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "region" TEXT NOT NULL,
    "atoll" TEXT,
    "island" TEXT,
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

-- CreateTable
CREATE TABLE "YaumiyyaParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "yaumiyyaId" TEXT NOT NULL,
    "userId" TEXT,
    "displayName" TEXT NOT NULL,
    "serviceNo" TEXT,
    "region" TEXT,
    CONSTRAINT "YaumiyyaParticipant_yaumiyyaId_fkey" FOREIGN KEY ("yaumiyyaId") REFERENCES "YaumiyyaRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "YaumiyyaRecord_region_idx" ON "YaumiyyaRecord"("region");

-- CreateIndex
CREATE INDEX "YaumiyyaRecord_date_idx" ON "YaumiyyaRecord"("date");

-- CreateIndex
CREATE INDEX "YaumiyyaParticipant_yaumiyyaId_idx" ON "YaumiyyaParticipant"("yaumiyyaId");

-- CreateIndex
CREATE INDEX "YaumiyyaParticipant_displayName_idx" ON "YaumiyyaParticipant"("displayName");
