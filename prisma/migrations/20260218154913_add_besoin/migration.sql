-- CreateTable
CREATE TABLE "Besoin" (
    "id" TEXT NOT NULL,
    "metierSlug" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "prenom" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOUVEAU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Besoin_pkey" PRIMARY KEY ("id")
);
