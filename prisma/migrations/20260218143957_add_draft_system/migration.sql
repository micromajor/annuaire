-- AlterTable
ALTER TABLE "Artisan" ADD COLUMN     "draftData" JSONB,
ADD COLUMN     "hasPendingDraft" BOOLEAN NOT NULL DEFAULT false;
