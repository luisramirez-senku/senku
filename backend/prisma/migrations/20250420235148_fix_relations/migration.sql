-- CreateEnum
CREATE TYPE "WalletPlatform" AS ENUM ('APPLE', 'GOOGLE');

-- CreateTable
CREATE TABLE "CustomerProgram" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "pointsBalance" INTEGER NOT NULL DEFAULT 0,
    "cashbackBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stampsBalance" INTEGER NOT NULL DEFAULT 0,
    "walletPassId" TEXT,
    "walletPlatform" "WalletPlatform",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProgram_walletPassId_key" ON "CustomerProgram"("walletPassId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProgram_customerId_programId_key" ON "CustomerProgram"("customerId", "programId");

-- AddForeignKey
ALTER TABLE "CustomerProgram" ADD CONSTRAINT "CustomerProgram_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProgram" ADD CONSTRAINT "CustomerProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "LoyaltyProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
