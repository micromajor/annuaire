-- CreateTable
CREATE TABLE "Avis" (
    "id" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "auteurPrenom" TEXT NOT NULL,
    "auteurEmail" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" VARCHAR(800) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avis_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "Artisan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
