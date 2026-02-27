/*
  Warnings:

  - A unique constraint covering the columns `[emailVerificationToken]` on the table `Artisan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Artisan" ADD COLUMN     "emailVerificationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Artisan_emailVerificationToken_key" ON "Artisan"("emailVerificationToken");
