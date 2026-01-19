/*
  Warnings:

  - You are about to drop the column `user_name` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `impersonated_by` to the `session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ban_expires` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ban_reason` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `banned` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `display_username` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `two_factor_enabled` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `user` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `user` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "user_user_name_idx";

-- DropIndex
DROP INDEX "user_user_name_key";

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "impersonated_by" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "user_name",
ADD COLUMN     "ban_expires" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ban_reason" TEXT NOT NULL,
ADD COLUMN     "banned" BOOLEAN NOT NULL,
ADD COLUMN     "display_username" TEXT NOT NULL,
ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_password_reset" ALTER COLUMN "valid_until" SET DEFAULT NOW() + interval '15 min';

-- CreateTable
CREATE TABLE "two_factor" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backup_codes" TEXT NOT NULL,

    CONSTRAINT "two_factor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_id_key" ON "two_factor"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE INDEX "user_username_idx" ON "user"("username");

-- AddForeignKey
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
