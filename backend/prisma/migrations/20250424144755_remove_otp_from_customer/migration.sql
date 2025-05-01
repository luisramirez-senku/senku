/*
  Warnings:

  - You are about to drop the column `otp` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `otpExpiresAt` on the `Customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "otp",
DROP COLUMN "otpExpiresAt";
