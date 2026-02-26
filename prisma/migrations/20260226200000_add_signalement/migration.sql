-- CreateTable
CREATE TABLE "Signalement" (
    "id" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "motif" VARCHAR(500) NOT NULL,
    "email" TEXT,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signalement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Signalement" ADD CONSTRAINT "Signalement_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "Artisan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
