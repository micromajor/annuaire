-- CreateEnum
CREATE TYPE "ArtisanStatus" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REJETE');

-- CreateTable
CREATE TABLE "Artisan" (
    "id" TEXT NOT NULL,
    "raisonSociale" TEXT,
    "siret" TEXT,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "siteWeb" TEXT,
    "description" VARCHAR(500),
    "status" "ArtisanStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Artisan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metier" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Metier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commune" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "codePostal" TEXT NOT NULL,

    CONSTRAINT "Commune_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtisanMetier" (
    "artisanId" TEXT NOT NULL,
    "metierId" TEXT NOT NULL,

    CONSTRAINT "ArtisanMetier_pkey" PRIMARY KEY ("artisanId","metierId")
);

-- CreateTable
CREATE TABLE "ArtisanCommune" (
    "artisanId" TEXT NOT NULL,
    "communeId" TEXT NOT NULL,

    CONSTRAINT "ArtisanCommune_pkey" PRIMARY KEY ("artisanId","communeId")
);

-- CreateTable
CREATE TABLE "ContactRequest" (
    "id" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "clientPrenom" TEXT NOT NULL,
    "clientNom" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientTel" TEXT,
    "message" VARCHAR(1000) NOT NULL,
    "typeTraux" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Artisan_siret_key" ON "Artisan"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "Artisan_email_key" ON "Artisan"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Metier_slug_key" ON "Metier"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Commune_nom_codePostal_key" ON "Commune"("nom", "codePostal");

-- AddForeignKey
ALTER TABLE "ArtisanMetier" ADD CONSTRAINT "ArtisanMetier_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "Artisan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtisanMetier" ADD CONSTRAINT "ArtisanMetier_metierId_fkey" FOREIGN KEY ("metierId") REFERENCES "Metier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtisanCommune" ADD CONSTRAINT "ArtisanCommune_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "Artisan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtisanCommune" ADD CONSTRAINT "ArtisanCommune_communeId_fkey" FOREIGN KEY ("communeId") REFERENCES "Commune"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactRequest" ADD CONSTRAINT "ContactRequest_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "Artisan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
