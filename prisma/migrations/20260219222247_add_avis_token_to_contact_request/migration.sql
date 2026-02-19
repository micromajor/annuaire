/*
  Warnings:

  - A unique constraint covering the columns `[avisToken]` on the table `ContactRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ContactRequest" ADD COLUMN     "avisToken" TEXT,
ADD COLUMN     "avisUsed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "ContactRequest_avisToken_key" ON "ContactRequest"("avisToken");
