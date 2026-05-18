-- AlterTable
ALTER TABLE "Task" ADD COLUMN "informationProvidedDate" DATETIME;
ALTER TABLE "Task" ADD COLUMN "island" TEXT;

-- CreateTable
CREATE TABLE "SharedToOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RequestTypeOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TaskSharedToOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "sharedToOptionId" TEXT NOT NULL,
    CONSTRAINT "TaskSharedToOption_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskSharedToOption_sharedToOptionId_fkey" FOREIGN KEY ("sharedToOptionId") REFERENCES "SharedToOption" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskRequestTypeOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "requestTypeOptionId" TEXT NOT NULL,
    CONSTRAINT "TaskRequestTypeOption_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskRequestTypeOption_requestTypeOptionId_fkey" FOREIGN KEY ("requestTypeOptionId") REFERENCES "RequestTypeOption" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SharedToOption_name_key" ON "SharedToOption"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RequestTypeOption_name_key" ON "RequestTypeOption"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TaskSharedToOption_taskId_sharedToOptionId_key" ON "TaskSharedToOption"("taskId", "sharedToOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskRequestTypeOption_taskId_requestTypeOptionId_key" ON "TaskRequestTypeOption"("taskId", "requestTypeOptionId");
