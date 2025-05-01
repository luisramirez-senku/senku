/*
  Warnings:

  - You are about to drop the column `active` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `costInPoints` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `cost` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "active",
DROP COLUMN "costInPoints",
DROP COLUMN "imageUrl",
DROP COLUMN "title",
ADD COLUMN     "cost" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "programId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "description";

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_programId_fkey" FOREIGN KEY ("programId") REFERENCES "LoyaltyProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
