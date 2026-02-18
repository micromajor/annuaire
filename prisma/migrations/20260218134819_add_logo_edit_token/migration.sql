-- AlterTable
ALTER TABLE "Artisan" ADD COLUMN     "logoUrl" TEXT;

-- CreateTable
CREATE TABLE "EditToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EditToken_token_key" ON "EditToken"("token");

-- AddForeignKey
ALTER TABLE "EditToken" ADD CONSTRAINT "EditToken_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "Artisan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
