-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('POINTS', 'CASHBACK', 'STAMPS');

-- CreateTable
CREATE TABLE "LoyaltyProgram" (
    "id" TEXT NOT NULL,
    "type" "ProgramType" NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "merchantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyProgram_pkey" PRIMARY KEY ("id")
);
