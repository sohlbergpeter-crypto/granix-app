CREATE TYPE "TimeReportType" AS ENUM ('arbete', 'sjuk', 'ledig', 'vab');

ALTER TABLE "TimeReport"
ADD COLUMN "type" "TimeReportType" NOT NULL DEFAULT 'arbete',
ALTER COLUMN "projectId" DROP NOT NULL;
