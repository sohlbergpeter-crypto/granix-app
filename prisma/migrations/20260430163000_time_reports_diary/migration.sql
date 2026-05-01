CREATE TYPE "AllowanceType" AS ENUM ('nej', 'halv', 'hel');

CREATE TABLE "TimeReport" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "hours" DOUBLE PRECISION NOT NULL,
  "travelWithinHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "travelOutsideHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "allowance" "AllowanceType" NOT NULL DEFAULT 'nej',
  "notes" TEXT NOT NULL,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TimeReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DiaryEntry" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "happenedToday" TEXT NOT NULL,
  "completedToday" TEXT NOT NULL,
  "extraWork" TEXT,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DiaryEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TimeReport_employeeId_date_idx" ON "TimeReport"("employeeId", "date");
CREATE INDEX "TimeReport_projectId_date_idx" ON "TimeReport"("projectId", "date");
CREATE INDEX "DiaryEntry_employeeId_date_idx" ON "DiaryEntry"("employeeId", "date");
CREATE INDEX "DiaryEntry_projectId_date_idx" ON "DiaryEntry"("projectId", "date");

ALTER TABLE "TimeReport" ADD CONSTRAINT "TimeReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimeReport" ADD CONSTRAINT "TimeReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimeReport" ADD CONSTRAINT "TimeReport_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DiaryEntry" ADD CONSTRAINT "DiaryEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiaryEntry" ADD CONSTRAINT "DiaryEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiaryEntry" ADD CONSTRAINT "DiaryEntry_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
