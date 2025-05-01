-- Asegurarse de que la extensión uuid-ossp esté habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- MERCHANT
ALTER TABLE "Merchant" ADD COLUMN "code" TEXT;
UPDATE "Merchant" SET "code" = uuid_generate_v4()::text;
ALTER TABLE "Merchant" ALTER COLUMN "code" SET NOT NULL;

-- LOYALTY PROGRAM
ALTER TABLE "LoyaltyProgram" ADD COLUMN "code" TEXT;
UPDATE "LoyaltyProgram" SET "code" = uuid_generate_v4()::text;
ALTER TABLE "LoyaltyProgram" ALTER COLUMN "code" SET NOT NULL;

-- REWARD
ALTER TABLE "Reward" ADD COLUMN "code" TEXT;
UPDATE "Reward" SET "code" = uuid_generate_v4()::text;
ALTER TABLE "Reward" ALTER COLUMN "code" SET NOT NULL;

-- BRANCH
ALTER TABLE "Branch" ADD COLUMN "code" TEXT;
UPDATE "Branch" SET "code" = uuid_generate_v4()::text;
ALTER TABLE "Branch" ALTER COLUMN "code" SET NOT NULL;
