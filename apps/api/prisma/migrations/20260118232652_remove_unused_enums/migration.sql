/*
  Warnings:

  - You are about to drop the column `status` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "user_password_reset" ALTER COLUMN "valid_until" SET DEFAULT NOW() + interval '15 min';

-- DropEnum
DROP TYPE "USER_ROLE";

-- DropEnum
DROP TYPE "USER_STATUS";
