-- CreateTable
CREATE TABLE "YaumiyyaAssignedTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "yaumiyyaId" TEXT NOT NULL,
    "assignedToUserId" TEXT,
    "assignedToName" TEXT NOT NULL,
    "assignedToServiceNo" TEXT,
    "assignedToRegion" TEXT,
    "taskDetails" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "YaumiyyaAssignedTask_yaumiyyaId_fkey" FOREIGN KEY ("yaumiyyaId") REFERENCES "YaumiyyaRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "YaumiyyaAssignedTask_yaumiyyaId_idx" ON "YaumiyyaAssignedTask"("yaumiyyaId");

-- CreateIndex
CREATE INDEX "YaumiyyaAssignedTask_assignedToUserId_idx" ON "YaumiyyaAssignedTask"("assignedToUserId");

-- CreateIndex
CREATE INDEX "YaumiyyaAssignedTask_assignedToName_idx" ON "YaumiyyaAssignedTask"("assignedToName");
