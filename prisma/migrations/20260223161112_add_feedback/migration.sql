-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "pageUrl" VARCHAR(500),
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOUVEAU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
