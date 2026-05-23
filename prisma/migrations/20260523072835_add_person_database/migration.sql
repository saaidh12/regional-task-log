-- CreateTable
CREATE TABLE "PersonRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "photoUrl" TEXT,
    "fullName" TEXT NOT NULL,
    "idNumber" TEXT,
    "address" TEXT,
    "mobileNumber" TEXT,
    "region" TEXT NOT NULL,
    "atoll" TEXT,
    "island" TEXT,
    "notes" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdByServiceNumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PersonRecord_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PersonNickname" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "PersonNickname_personId_fkey" FOREIGN KEY ("personId") REFERENCES "PersonRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrimeCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PersonCrimeCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "crimeCategoryId" TEXT NOT NULL,
    CONSTRAINT "PersonCrimeCategory_personId_fkey" FOREIGN KEY ("personId") REFERENCES "PersonRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PersonCrimeCategory_crimeCategoryId_fkey" FOREIGN KEY ("crimeCategoryId") REFERENCES "CrimeCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PersonRecord_region_idx" ON "PersonRecord"("region");

-- CreateIndex
CREATE INDEX "PersonRecord_fullName_idx" ON "PersonRecord"("fullName");

-- CreateIndex
CREATE INDEX "PersonRecord_idNumber_idx" ON "PersonRecord"("idNumber");

-- CreateIndex
CREATE INDEX "PersonRecord_mobileNumber_idx" ON "PersonRecord"("mobileNumber");

-- CreateIndex
CREATE INDEX "PersonNickname_name_idx" ON "PersonNickname"("name");

-- CreateIndex
CREATE INDEX "CrimeCategory_region_idx" ON "CrimeCategory"("region");

-- CreateIndex
CREATE UNIQUE INDEX "CrimeCategory_name_region_key" ON "CrimeCategory"("name", "region");

-- CreateIndex
CREATE UNIQUE INDEX "PersonCrimeCategory_personId_crimeCategoryId_key" ON "PersonCrimeCategory"("personId", "crimeCategoryId");
