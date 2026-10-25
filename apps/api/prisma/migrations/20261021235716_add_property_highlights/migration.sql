-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "badgeLabel" TEXT,
ADD COLUMN     "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "negotiable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "helpfulCount" INTEGER NOT NULL DEFAULT 0;
