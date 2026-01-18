/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `simulations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "simulations" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_email_validations" ALTER COLUMN "updated_at" DROP NOT NULL;
