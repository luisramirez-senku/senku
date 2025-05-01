/*
  Warnings:

  - The `walletPlatform` column on the `CustomerProgram` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "CustomerProgram_customerId_programId_key";

-- DropIndex
DROP INDEX "CustomerProgram_walletPassId_key";

-- AlterTable
ALTER TABLE "CustomerProgram" ADD COLUMN     "branchId" TEXT,
DROP COLUMN "walletPlatform",
ADD COLUMN     "walletPlatform" TEXT;

-- AddForeignKey
ALTER TABLE "CustomerProgram" ADD CONSTRAINT "CustomerProgram_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
