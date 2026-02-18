-- AlterTable
ALTER TABLE "Besoin" ADD COLUMN     "artisanId" TEXT,
ADD COLUMN     "photos" JSONB,
ALTER COLUMN "contact" DROP NOT NULL;
